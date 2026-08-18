const asyncHandler = require('../utils/asyncHandler');
const { runDueScan } = require('../services/notificationEngine');

// POST /notifications/run-scan
// Manually triggers the same due/overdue/reminder scan that otherwise runs
// on a timer (see server.js). Useful for testing, or for a CHW who doesn't
// want to wait for the next automatic run.
exports.runScan = asyncHandler(async (req, res) => {
  const created = await runDueScan();
  res.status(200).json({
    scannedAt: new Date(),
    notificationsCreated: created.length,
    notifications: created,
  });
});
