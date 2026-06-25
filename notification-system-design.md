# Notification System Design

## Stage 1

### REST API Endpoints

#### Authentication
All endpoints require `Authorization: Bearer <token>` header.

---

#### GET /notifications
Fetch all notifications for the logged-in student.

**Response 200:**
```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "Placement",
      "message": "Google is hiring",
      "isRead": false,
      "createdAt": "2026-04-22T17:51:30Z"
    }
  ]
}
```

---

#### GET /notifications/:id
Fetch a single notification.

**Response 200:**
```json
{
  "id": "uuid",
  "type": "Result",
  "message": "mid-sem results published",
  "isRead": true,
  "createdAt": "2026-04-22T17:51:30Z"
}
```

---

#### PATCH /notifications/:id/read
Mark a notification as read.

**Response 200:**
```json
{ "message": "Notification marked as read" }
```

---

#### PATCH /notifications/read-all
Mark all notifications as read.

**Response 200:**
```json
{ "message": "All notifications marked as read" }
```

---

#### DELETE /notifications/:id
Delete a notification.

**Response 200:**
```json
{ "message": "Notification deleted" }
```

---

### Real-Time Notifications

Use **WebSockets** (via Socket.IO or native `ws`).

- On login, the client connects: `ws://server/notifications?token=<jwt>`
- Server authenticates the token and joins the student to a room keyed by `studentId`
- When a new notification is created for a student, the server emits to their room:

```json
{
  "event": "new_notification",
  "data": {
    "id": "uuid",
    "type": "Placement",
    "message": "Microsoft is hiring",
    "createdAt": "2026-04-22T17:51:30Z"
  }
}
```

- Client listens and updates the UI without polling.

---

## Stage 2

### Database Choice: PostgreSQL

**Why PostgreSQL:**
- Notifications have a fixed, predictable schema — relational model fits well.
- Strong support for indexes, partial indexes, and efficient range queries on timestamps.
- ACID guarantees ensure no notifications are lost or double-written.
- Supports ENUM types natively.

---

### Schema

```sql
CREATE TYPE notification_type AS ENUM ('Placement', 'Result', 'Event');

CREATE TABLE students (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) UNIQUE NOT NULL,
  roll_no     VARCHAR(20) UNIQUE NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE notifications (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id        INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  type              notification_type NOT NULL,
  message           TEXT NOT NULL,
  is_read           BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMP DEFAULT NOW()
);
```

---

### Problems at Scale (50,000 students, 5,000,000 notifications)

| Problem | Solution |
|---|---|
| Slow queries on unread notifications | Add composite index on `(student_id, is_read, created_at DESC)` |
| Table too large for full scans | Partition `notifications` by `created_at` (monthly ranges) |
| Hot rows on `is_read` updates | Batch updates, avoid row-level locks |
| Read-heavy load | Add a read replica for SELECT queries |

---

### Queries

**Fetch unread notifications for a student:**
```sql
SELECT id, type, message, created_at
FROM notifications
WHERE student_id = 1042 AND is_read = FALSE
ORDER BY created_at DESC;
```

**Mark all as read:**
```sql
UPDATE notifications
SET is_read = TRUE
WHERE student_id = 1042 AND is_read = FALSE;
```

**Count unread:**
```sql
SELECT COUNT(*) FROM notifications
WHERE student_id = 1042 AND is_read = FALSE;
```

---

## Stage 3

### Is the query accurate?

```sql
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt DESC;
```

Yes, it is logically correct. It returns all unread notifications for a given student ordered by most recent. However `SELECT *` is wasteful — only the required columns should be fetched.

---

### Why is it slow?

At 5,000,000 rows with no index, the database does a **full table scan**, reading every row to filter by `studentID` and `isRead`. Even if `studentID` has an index, the additional filter on `isRead` and the sort on `createdAt` require extra work without a composite index.

---

### Fix

```sql
-- Add a partial composite index (only unread rows — far smaller index)
CREATE INDEX idx_notifications_unread
ON notifications (student_id, created_at DESC)
WHERE is_read = FALSE;

-- Optimized query
SELECT id, type, message, created_at
FROM notifications
WHERE student_id = 1042 AND is_read = FALSE
ORDER BY created_at DESC;
```

**Likely cost:** With this index, the query becomes an **index scan** on a small subset of rows (only unread ones). Cost drops from O(N) full scan to O(log N + k) where k is the number of unread rows for that student — typically negligible.

---

### Should you index every column?

No. Indexes speed up reads but slow down writes (every INSERT/UPDATE must update all indexes). At 50,000 students generating millions of notifications, write throughput matters. Only index columns that appear in WHERE clauses or ORDER BY in frequent queries.

---

### Placement notifications in the last 7 days

```sql
SELECT DISTINCT s.id, s.name, s.email
FROM students s
JOIN notifications n ON n.student_id = s.id
WHERE n.type = 'Placement'
  AND n.created_at >= NOW() - INTERVAL '7 days';
```

---

## Stage 4

### Problem
Fetching all notifications on every page load causes redundant DB reads and high latency at scale.

---

### Solutions and Tradeoffs

**1. Pagination**
Return notifications in pages (`limit` + `offset` or cursor-based).
- ✅ Reduces data transferred per request
- ✅ Simple to implement
- ❌ Doesn't reduce DB hits if the user refreshes frequently

**2. Client-side caching (HTTP Cache-Control / ETag)**
Browser caches the response; only re-fetches if data changed.
- ✅ Zero DB hits on repeated loads with same data
- ❌ Cache invalidation is tricky when new notifications arrive

**3. Server-side caching (Redis)**
Cache each student's unread notification list in Redis with a short TTL (e.g., 30s).
- ✅ Eliminates DB load on repeated fetches
- ✅ Fast reads (sub-millisecond)
- ❌ Slight staleness window (TTL duration)
- ❌ Cache invalidation needed on new notification or read event

**4. Push over Poll (WebSockets / SSE)**
Instead of fetching on every page load, push new notifications to the client in real time (as designed in Stage 1). Client maintains state locally.
- ✅ Eliminates polling entirely
- ✅ Instant delivery
- ❌ Requires persistent connection management
- ❌ More complex server infrastructure

**Recommended approach:** Pagination + Redis cache + WebSocket push. On page load, serve from cache. New notifications are pushed via WebSocket and appended client-side without a fresh fetch.

---

## Stage 5

### Shortcomings of the proposed implementation

```
function notify_all(student_ids, message):
    for student_id in student_ids:
        send_email(student_id, message)
        save_to_db(student_id, message)
        push_to_app(student_id, message)
```

1. **Synchronous loop over 50,000 students** — runs sequentially, takes very long.
2. **No error handling or retries** — one failure stops the loop or is silently lost.
3. **Tight coupling** — email, DB write, and push are bundled; one failure blocks the others.
4. **No idempotency** — if the process crashes midway, re-running it will duplicate notifications.
5. **Email API rate limits** — calling `send_email` 50,000 times in a loop will hit rate limits.

---

### 200 email failures midway

With the current implementation, there is no way to know which 200 failed or retry only them. The entire batch would need to be re-run, causing duplicates for the 49,800 that succeeded.

---

### Redesigned approach

Separate the concerns into three independent, async, retryable steps using a message queue (e.g., Redis Queue, BullMQ, or SQS):

```
function notify_all(student_ids, message):
    for student_id in student_ids:
        enqueue("email_queue", { student_id, message, idempotency_key: hash(student_id + message) })
        enqueue("db_queue",    { student_id, message, idempotency_key: hash(student_id + message) })
        enqueue("push_queue",  { student_id, message, idempotency_key: hash(student_id + message) })

// Separate workers (can run in parallel, with retries)
worker("email_queue"):
    job = dequeue()
    if already_processed(job.idempotency_key): skip
    result = send_email(job.student_id, job.message)
    if result.failed: requeue(job, delay=exponential_backoff)
    else: mark_processed(job.idempotency_key)

worker("db_queue"):
    job = dequeue()
    if already_processed(job.idempotency_key): skip
    save_to_db(job.student_id, job.message)
    mark_processed(job.idempotency_key)

worker("push_queue"):
    job = dequeue()
    push_to_app(job.student_id, job.message)
```

---

### Should DB write and email send happen together?

No. They serve different purposes and have different failure modes:
- The DB write is the **source of truth** — it should always succeed regardless of email delivery.
- Email is a **delivery channel** — it can fail, be delayed, or be rate-limited without affecting the stored notification.
- Coupling them means a failed email API call would roll back or skip the DB write, leaving the student with no in-app notification either.

They should be independent, async operations with separate retry logic.

---

## Stage 6

### Approach: Min-Heap for Top-N Priority Notifications

**Scoring formula:**

```
score = type_weight + normalized_recency
```

Where:
- `type_weight`: Placement = 3, Result = 2, Event = 1
- `normalized_recency`: `(timestamp - min_timestamp) / (max_timestamp - min_timestamp)` → value in [0, 1]

This ensures type always dominates (a newer Event never outranks an older Placement), while recency breaks ties within the same type.

---

### Efficient Top-N with a Min-Heap

A **min-heap of size N** maintains the top N notifications efficiently:
- Insert each notification into the heap.
- If heap size exceeds N, evict the lowest-scored item.
- Final heap contains the top N; sort descending for display.

**Time complexity:** O(M log N) where M = total notifications, N = top N size.

**Handling new incoming notifications:** When a new notification arrives, compute its score and push it into the heap. If it beats the current minimum (heap root), the minimum is evicted and the new one takes its place. This is O(log N) per insertion — efficient even with continuous incoming notifications.

---

### Implementation

See `notification-app-be/src/index.js` for the working implementation.

**Sample output (top 10):**
```
1. [Placement] CSX Corporation hiring — 2026-06-25 07:30:52 (score: 4.0000)
2. [Placement] Amgen Inc. hiring — 2026-06-25 02:29:58 (score: 3.7667)
3. [Placement] Marriott International Inc. hiring — 2026-06-24 23:30:16 (score: 3.6274)
4. [Placement] Microsoft Corporation hiring — 2026-06-24 16:00:25 (score: 3.2786)
5. [Placement] Amazon.com Inc. hiring — 2026-06-24 12:59:40 (score: 3.1384)
6. [Placement] Broadcom Inc. hiring — 2026-06-24 10:59:31 (score: 3.0452)
7. [Result] mid-sem — 2026-06-24 23:30:43 (score: 2.6277)
8. [Result] end-sem — 2026-06-25 00:58:55 (score: 2.6054)
9. [Result] internal — 2026-06-24 13:59:49 (score: 2.3031)
10. [Result] end-sem — 2026-06-24 10:28:37 (score: 2.1)
```
