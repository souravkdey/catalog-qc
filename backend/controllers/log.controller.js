const Log = require("../models/Log");

const getAllLogs = async () => {
  return await Log.find().sort({ createdAt: -1 });
};

exports.getLogs = async (req, res) => {
  try {
    const logs = await getAllLogs();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
