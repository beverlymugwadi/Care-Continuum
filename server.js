const app = require('./src/app');
const config = require('./src/config');
const connectDB = require('./src/config/db');

async function start() {
  try {
    await connectDB();
  } catch (err) {
    console.error('✗ Startup aborted: could not connect to MongoDB');
    process.exit(1);
  }

  app.listen(config.port, () => {
    console.log(`✓ Care Continuum server running on port ${config.port} (${config.nodeEnv})`);
  });
}

start();

module.exports = app;
