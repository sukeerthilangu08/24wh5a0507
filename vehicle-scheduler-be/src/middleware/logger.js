const logger = (req, res, next) => {
  const start = Date.now();

  console.log({
    event: "incoming_request",
    method: req.method,
    url: req.originalUrl,
    timestamp: new Date().toISOString(),
  });

  const originalSend = res.send.bind(res);
  res.send = (body) => {
    console.log({
      event: "outgoing_response",
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTimeMs: Date.now() - start,
      timestamp: new Date().toISOString(),
    });
    return originalSend(body);
  };

  next();
};

module.exports = logger;
