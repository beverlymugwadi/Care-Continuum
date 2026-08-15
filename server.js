const express = require('express');
const config = require('./src/config');
const connectDB = require('./src/config/db');
const routes = require('./src/routes');
const notFound = require('./src/middleware/notFound');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.get('/', (req, res) => {
  res.send('Care Continuum API is running');
});

app.use(notFound);
app.use(errorHandler);

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
