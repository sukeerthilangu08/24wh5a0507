const { schedule } = require("../service/schedulerService");

const getSchedule = async (req, res, next) => {
  try {
    const result = await schedule();
    res.json({ schedule: result });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSchedule };
