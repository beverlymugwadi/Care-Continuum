const express = require('express');
const routes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

// Just the configured Express app -- no DB connection, no listen(). Kept
// separate from server.js so it can be required directly by tests
// (Supertest drives it in-process) without side effects like binding a
// port or connecting to MongoDB on import.
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.get('/', (req, res) => {
  res.send('Care Continuum API is running');
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
