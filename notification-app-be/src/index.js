const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const axios = require("axios");

const BASE_URL = process.env.BASE_URL;
const TOP_N = parseInt(process.env.TOP_N) || 10;

// Priority weights: higher = more important
const TYPE_WEIGHT = { Placement: 3, Result: 2, Event: 1 };

// Normalize timestamp to ms
const toMs = (ts) => new Date(ts).getTime();

// Score: type weight heavily + recency (normalized to 0-1 within the batch)
const score = (notification, minTs, maxTs) => {
  const recency = maxTs === minTs ? 1 : (toMs(notification.Timestamp) - minTs) / (maxTs - minTs);
  return TYPE_WEIGHT[notification.Type] + recency;
};

// Min-heap of size N — insert a notification, evict lowest-scored if over capacity
class MinHeap {
  constructor(n) {
    this.n = n;
    this.heap = [];
  }

  _score(item) { return item._score; }

  push(item) {
    this.heap.push(item);
    this._bubbleUp(this.heap.length - 1);
    if (this.heap.length > this.n) this._pop(); // evict lowest
  }

  _pop() {
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length) {
      this.heap[0] = last;
      this._sinkDown(0);
    }
    return top;
  }

  _bubbleUp(i) {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this._score(this.heap[parent]) <= this._score(this.heap[i])) break;
      [this.heap[i], this.heap[parent]] = [this.heap[parent], this.heap[i]];
      i = parent;
    }
  }

  _sinkDown(i) {
    const n = this.heap.length;
    while (true) {
      let min = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this._score(this.heap[l]) < this._score(this.heap[min])) min = l;
      if (r < n && this._score(this.heap[r]) < this._score(this.heap[min])) min = r;
      if (min === i) break;
      [this.heap[i], this.heap[min]] = [this.heap[min], this.heap[i]];
      i = min;
    }
  }

  toSortedDesc() {
    return [...this.heap].sort((a, b) => b._score - a._score);
  }
}

async function getToken() {
  const res = await axios.post(`${BASE_URL}/auth`, {
    email: process.env.EMAIL,
    name: process.env.NAME,
    rollNo: process.env.ROLL_NO,
    accessCode: process.env.ACCESS_CODE,
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
  });
  return res.data.access_token;
}

async function getNotifications(token) {
  const res = await axios.get(`${BASE_URL}/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.notifications;
}

function getTopN(notifications, n) {
  const timestamps = notifications.map((n) => toMs(n.Timestamp));
  const minTs = Math.min(...timestamps);
  const maxTs = Math.max(...timestamps);

  const heap = new MinHeap(n);
  for (const notif of notifications) {
    notif._score = score(notif, minTs, maxTs);
    heap.push(notif);
  }
  return heap.toSortedDesc();
}

async function main() {
  const token = await getToken();
  const notifications = await getNotifications(token);

  console.log(`\nFetched ${notifications.length} notifications. Showing top ${TOP_N}:\n`);

  const top = getTopN(notifications, TOP_N);
  top.forEach((n, i) => {
    console.log(`${i + 1}. [${n.Type}] ${n.Message} — ${n.Timestamp} (score: ${n._score.toFixed(4)})`);
  });
}

main().catch(console.error);
