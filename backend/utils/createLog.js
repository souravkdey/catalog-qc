const Log = require("../models/Log");

async function createLog({ action, productId, before = null, after = null }) {
  try {
    if (!action || !productId) return;

    await Log.create({
      action,
      productId,
      changes: {
        before,
        after,
      },
    });
  } catch (err) {
    console.error("Log error:", err.message);
  }
}

module.exports = createLog;
