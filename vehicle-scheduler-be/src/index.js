const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const express = require("express");
const config = require("./config/config");
const logger = require("./middleware/logger");
const { getSchedule } = require("./controller/schedulerController");

const app = express();
app.use(express.json());
app.use(logger);

app.get("/health", (req, res) => res.json({ status: "ok" }));
app.get("/schedule", getSchedule);

app.use((err, req, res, next) => {
  console.log({ event: "error", message: err.message, timestamp: new Date().toISOString() });
  res.status(500).json({ error: err.message });
});

app.listen(config.port, () => {
  console.log(`Vehicle Scheduler running on port ${config.port}`);
});

module.exports = app;
