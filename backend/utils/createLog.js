const Log = require("../models/Log");

async function createLog({ action, productId, before = null, after = null }) {
  try {
    if (!action || !productId) return; // ensure required fields

    await Log.create({
      action,
      productId,
      changes: {
        before,
        after,
      },
    });
  } catch (err) {
    console.error("Log error:", err.message); // log only message
  }
}

module.exports = createLog;
