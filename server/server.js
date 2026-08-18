const app = require('./src/app');
const config = require('./src/config');
const connectDB = require('./src/config/db');
const { runDueScan } = require('./src/services/notificationEngine');

// Periodic scan for time-based mother notifications (ANC reminders/missed
// visits, vaccination due/overdue, growth checkup due). Kept as a plain
// setInterval rather than a cron dependency since there's no need for
// calendar-precise scheduling (e.g. "run at 8am") -- just "run regularly".
// Deliberately lives here, not in src/app.js, so importing the app for
// tests (Supertest) never starts a background timer.
function scheduleNotificationScan() {
  const intervalMs = config.notificationScanIntervalHours * 60 * 60 * 1000;

  async function runOnce() {
    try {
      const created = await runDueScan();
      if (created.length > 0) {
        console.log(`✓ Notification scan: ${created.length} notification(s) sent`);
      }
    } catch (err) {
      console.error('✗ Notification scan failed:', err.message);
    }
  }

  runOnce(); // catch anything already due as soon as the server comes up
  setInterval(runOnce, intervalMs);
}

async function start() {
  try {
    await connectDB();
  } catch (err) {
    console.error('✗ Startup aborted: could not connect to MongoDB');
    process.exit(1);
  }

  scheduleNotificationScan();

  app.listen(config.port, () => {
    console.log(`✓ Care Continuum server running on port ${config.port} (${config.nodeEnv})`);
  });
}

start();

module.exports = app;
