const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const express = require("express");
const logger = require("./middleware/logger");
const config = require("./config/config");

const app = express();

app.use(express.json());
app.use(logger);

app.get("/health", (req, res) => {
  console.log("Health endpoint hit");
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});



app.use((err, req, res, next) => {
  console.log({
    event: "error",
    method: req.method,
    url: req.originalUrl,
    error: err.message,
    timestamp: new Date().toISOString(),
  });
  res.status(500).json({ error: err.message });
});

app.listen(config.port, () => {
  console.log(`Logging middleware running on port ${config.port}`);
});

module.exports = app;
