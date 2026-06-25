Campus Notifications Microservice
Deliverables
You're a backend developer working on a campus notification platform where students receive real-time updates regarding Placements, Events, and Results. You have to incrementally solve different tasks across stages. Not every stage requires coding, each stage has clear instructions on the deliverables. You're expected to commit and push your deliverables to the same GitHub Repository that you created while implementing the Logging Middleware at frequent intervals. Direct submission of your response at the end of the test as a single commit will result in lower points for your submission.
As you progress through the stages, you may revise your submission for the previous stages. Your submission will be evaluated across stages both individually and cumulatively.
Stage 1
Assume a front-end developer colleague has asked you for REST API design, contract and structure to display notifications to the users when they are logged in. Identify the core actions that the notification platform should support. Now, you have to present the REST API endpoints along with their JSON request, response, and headers structures using an appropriate format.
Define clear and consistent endpoints for each action, using predictable naming conventions, and design JSON schemas with essential fields. Also, you are to design a mechanism for real-time notifications.
Submit your response as a markdown file called notification_system_design.md to the same repository you created while creating the logging middleware.
Label your response with "Stage 1" as heading.
Stage 2
On the basis of the APIs and contract you created earlier, you now have to store the same reliably. Which persistent storage (DB) do you suggest and explain your choice. Write the applicable DB schema. What problems could arise as the data volume increases? How would you solve such problems? Write SQL or NoSQL queries based on your DB schema and the REST APIs that you designed in Stage 1.
Submit your response in a new section labeled "Stage 2" by expanding the same Notification_System_Design.md file.
Stage 3
An earlier developer in the team chose a relational database for storage (MySQL or PostgreSQL) about 3 months ago. Now the database has grown to 50,000 students and 5,000,000 notifications. The developer had written the below query to fetch all the unread notifications of a student as a part of the notification API that was developed, which is now performing slowly.
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt DESC;
Is this query accurate? Why is this slow? What would you change and what would be the likely computation cost?
Another developer on your team suggests adding indexes on every column to be safe. Is this advice effective? Why/Why not?
Write a query to find all students who got a placement notification in the last 7 days. The table contains "notificationType" as a column which accepts "notification_type" enum values. "notification_type" enum contains "Event", "Result" and "Placement".
Submit your response in a new section labeled "Stage 3" by expanding the same notification_system_design.md file.
Stage 4
The notifications are being fetched on each page load for every student. The DB is getting overwhelmed which is causing a bad user experience.
What solution will you suggest? How will you improve performance?
Elaborate on the tradeoffs of each strategy you suggest.
Submit your response in a new section labeled "Stage 4" by expanding the same Notification_System_Design.md file.
Stage 5
It is placement season. The HR clicks on "Notify All" and 50,000 students should get an email and an in-app notification simultaneously.
Below is pseudocode for the proposed implementation.
function notify_all(student_ids: array, message: string):
    for student_id in student_ids:
        send_email(student_id, message)      # calls Email API
        save_to_db(student_id, message)      # DB Insert
        push_to_app(student_id, message)     # implementation is based on whatever real time notification mechanism you have chosen in Stage 1
What shortcomings do you observe with this implementation?
Logs indicate that the "send_email" call failed for 200 students midway. What now?
How would you redesign this to be reliable and fast?
Should the process of saving to DB as well as sending the email happen together? Why or why not?
Submit revised pseudocode along with your response to these questions in a new section labeled "Stage 5" by expanding the same Notification_System_Design.md file.
Stage 6
You've received user feedback from your product manager, they'd like to introduce a Priority Inbox that always displays the top 'n' most important unread notifications first (n could be top 10, 15, 20, etc. as per user's choice).
Priority should be determined based on a combination of weight (placement > result > event) and recency.
Implement your approach or solution in any language of your choice (Go, Rust, Python, TypeScript, JavaScript, Java etc).
Write code only to find top 10 notifications (DB query is not expected).
Your submission should be an actual functioning code file and not pseudo-code.
You're also expected to upload screenshots of your output displaying the priority notifications.
Both the code and the screenshots are to be pushed to the same GitHub repository.
Also note that new notifications will keep coming in. How will you maintain the top 10 efficiently?
In addition to the code and screenshots, you may revise the same notification_system_design.md file to also explain your approach in this stage in a new section labeled "Stage 6".
To simplify your task, you're also provided with the below Notification API. You are expected to use the API to fetch the notifications. You need not store them in a database, nor are you supposed to hard-code or create notifications yourself.
Notification API (GET)
http://4.224.186.213/evaluation-service/notifications
Constraints
API is a protected Route
Response (Status Code: 200)
{
  "notifications": [
    {
      "ID": "d146095a-0d86-4a34-9e69-3900a14576bc",
      "Type": "Result",
      "Message": "mid-sem",
      "Timestamp": "2026-04-22 17:51:30"
    }
  ]
}
{
  "notifications": [
    {
      "ID": "d146095a-0d86-4a34-9e69-3900a14576bc",
      "Type": "Result",
      "Message": "mid-sem",
      "Timestamp": "2026-04-22 17:51:30"
    },
    {
      "ID": "b283218f-ea5a-4b7c-93a9-1f2f240d64b0",
      "Type": "Placement",
      "Message": "CSX Corporation hiring",
      "Timestamp": "2026-04-22 17:51:18"
    },
    {
      "ID": "81589ada-0ad3-4f77-9554-f52fb558e09d",
      "Type": "Event",
      "Message": "farewell",
      "Timestamp": "2026-04-22 17:51:06"
    },
    {
      "ID": "0005513a-142b-4bbc-8678-eefec651e1ed",
      "Type": "Result",
      "Message": "mid-sem",
      "Timestamp": "2026-04-22 17:50:54"
    },
    {
      "ID": "ea836726-c25e-4f21-a72f-544a6af8a37f",
      "Type": "Result",
      "Message": "project-review",
      "Timestamp": "2026-04-22 17:50:42"
    },
    {
      "ID": "003cb427-8fc6-47f7-bb00-be228f6b0d2c",
      "Type": "Result",
      "Message": "external",
      "Timestamp": "2026-04-22 17:50:30"
    },
    {
      "ID": "ec54ff20-31bf-4d40-8f02-72fda59e8918",
      "Type": "Result",
      "Message": "project-review",
      "Timestamp": "2026-04-22 17:50:18"
    },
    {
      "ID": "1cfcfe5e-ad37-4894-8946-d707627176a5",
      "Type": "Event",
      "Message": "tech-fest",
      "Timestamp": "2026-04-22 17:50:06"
    },
    {
      "ID": "cf2885a6-45ac-4ba0-b548-6e9e9d4c52c8",
      "Type": "Result",
      "Message": "project-review",
      "Timestamp": "2026-04-22 17:49:54"
    },
    {
      "ID": "8a7412bd-6065-4d09-8501-a37f11cc848b",
      "Type": "Placement",
      "Message": "Advanced Micro Devices Inc. hiring",
      "Timestamp": "2026-04-22 17:49:42"
    }
  ]
}




























Great, this gives enough context to understand the problem. I won't solve the OA for you, but I can definitely help you understand the task and debug your implementation.
What the backend problem is asking
There are two independent parts.
Part 1: Vehicle Maintenance Scheduler
The APIs provide:
GET /depots
Returns multiple depots.
Each depot has:
ID
MechanicHours (the available hours)
GET /vehicles
Returns maintenance tasks.
Each task has:
TaskID
Duration
Impact
Your goal is:
For each depot, choose a subset of tasks such that:
Total Duration ≤ MechanicHours
Total Impact is maximized
This is the classic 0/1 Knapsack problem.
For every depot you will run Knapsack once.

Time Complexity
If
N = number of tasks
H = mechanic hours
Then DP complexity is
O(N × H)
which is efficient enough for reasonable values of H.

Part 2: Campus Notifications
The document says this is divided into Stage 1, Stage 2, ...
Each stage builds on the previous one. You'll need to scroll further down to see the specific requirements for each stage.

Architecture you should build
Since it's a backend microservice, organize it cleanly.
src
│
├── controller
│
├── service
│
├── dto
│
├── model
│
├── util
│
├── middleware
│
├── config
│
└── routes


Logging middleware

The instructions make this mandatory.
Implement logging before writing business logic.
Log:
Request URL
Method
Timestamp
Response status
Response time
If using Express, this is typically middleware applied globally.

Order of work
Clone repo.
Register.
Authenticate.
Add logging middleware.
Fetch depot API.
Fetch vehicles API.
Implement Knapsack.
Return results.
Start Campus Notification stages.
Test with Postman.
Push commits regularly.

One important thing
I notice your screenshots stop just before the actual deliverables.
The left sidebar shows:
Stage 1
Stage 2
Stage 3
Stage 4
Stage 5
Stage 6
Those pages contain the exact implementation requirements and are critical for completing the assignment.
Please scroll to Stage 1 and send screenshots of Stages 1–6 (or the text). Once I can see those, I can explain what each stage expects, help you interpret the requirements, and assist with debugging your implementation without writing the OA solution for you.

Here's what each stage is testing
Stage 1 — REST API Design
Design the notification service APIs.
Define endpoints, request/response JSON, headers, status codes.
Explain how real-time notifications would work (e.g., WebSocket, Server-Sent Events, etc.).
Deliverable: notification_system_design.md.
Stage 2 — Database Design
Choose SQL or NoSQL and justify the choice.
Design the schema.
Explain how you'd handle increasing data volume.
Write example queries based on your schema.
Stage 3 — Database Optimization
Analyze the provided slow query.
Explain why it's slow.
Recommend appropriate indexes (not "index every column").
Write the query for placement notifications in the last 7 days.
Stage 4 — Performance
The system fetches notifications on every page load.
Suggest improvements like caching, pagination, lazy loading, push updates, etc.
Discuss trade-offs.
Stage 5 — Large-scale Notification Delivery
Review the pseudocode.
Explain why it's unreliable.
Redesign it using queues/workers/retries and asynchronous processing.
Explain why DB writes and email sending shouldn't necessarily be tightly coupled.
Stage 6 — Coding
This is the only stage that requires code.
You need to:
Call the Notification API.
Compute the top 10 priority notifications.
Priority depends on:
notification type (Placement > Result > Event)
recency
Keep the top 10 efficiently as new notifications arrive.
Produce working code (not pseudocode).

Your overall work
From what I can see, your submission includes:
✅ Logging middleware
✅ Vehicle maintenance scheduler (0/1 Knapsack)
✅ notification_system_design.md with Stages 1–5
✅ Java implementation for Stage 6
✅ Screenshots
✅ Push everything to GitHub

My recommendation
Since the deadline is limited, prioritize in this order:
Vehicle Maintenance Scheduler (actual coding)
Stage 6 (actual coding)
Stages 1–5 (write the markdown answers)
Screenshots
Git commits
Submission
The coding portions are generally weighted more heavily than the design discussion.

I can help you quickly
I can't write the OA submission for you, but I can absolutely help you understand requirements, debug your implementation, review your code, or explain algorithms and design choices.
As you work, send me:
your project structure,
the template repository,
the specific error you're hitting,
or the code you've written,
and I'll help you get unstuck as quickly as possible.


Tih is teh mail they sent us : 

Tell me which kanguyage to use when




Placements_BVRITH <placements@bvrithyderabad.edu.in>



1:01 PM (23 minutes ago)





to 23wh1a0430, 23wh1a0471, 23wh1a0474, 23wh1a0497, 23wh1a04a8, 23wh1a04b8, 23wh1a04c0, 23wh1a0505, 23wh1a0513, 23wh1a0514, 23wh1a0530, 23wh1a0531, 23wh1a0536, 23wh1a0548, 23wh1a0559, 23wh1a0568, 23wh1a0569, 23wh1a0571, 23wh1a0574, 23wh1a0579, 23wh1a0589, 23wh1a0598, 23wh1a0599, 23wh1a05a2, 23wh1a05a5, 23wh1a05a7, 23wh1a05b7, 23wh1a05c5, 23wh1a05d0, 23wh1a05d3, 23wh1a05e7, 23wh1a05f1, 23wh1a05g0, 23wh1a05g4, 23wh1a05g7, 23wh1a05g8, 23wh1a05h5, 23wh1a05i2, 23wh1a05i3, 23wh1a05i4, 23wh1a05i8, 23wh1a1205, 23wh1a1216, 23wh1a1221, 23wh1a1222, 23wh1a1227, VENKATA, 23wh1a1232, 23wh1a1233, 23wh1a1237, 23wh1a1240, 23wh1a1247, SREE, 23wh1a1255, 23wh1a1262, MAHATHI, 23wh1a1274, 23wh1a1276, 23wh1a1287, 23wh1a1289, 23wh1a1298, 23wh1a12a1, 23wh1a12b6, 23wh1a6605, 23wh1a6608, 23wh1a6611, 23wh1a6615, 23wh1a6616, 23wh1a6623, 23wh1a6624, 23wh1a6638, 23wh1a6639, 23wh1a6646, 23wh1a6649, 23wh1a6653, SUVARNA, 23wh1a6660, 24wh5a0402, 24wh5a0403, 24wh5a0501, 24wh5a0502, me, 24wh5a0508, 24wh5a0510, 24wh5a0513, 24wh5a0516, 24wh5a0519, 24wh5a1202, 24wh5a1210, 24wh5a6607


