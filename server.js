const express = require('express');
const config = require('./src/config');
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

app.listen(config.port, () => {
  console.log(`Care Continuum server running on port ${config.port} (${config.nodeEnv})`);
});

module.exports = app;
