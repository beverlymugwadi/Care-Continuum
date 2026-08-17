const request = require('supertest');
const app = require('../../src/app');

let counter = 0;

/**
 * Registers a fresh CHW user via the real /api/auth/register endpoint and
 * returns their token, so tests exercise the actual registration/login
 * path rather than inserting a User document directly.
 */
async function createAuthedChw(overrides = {}) {
  counter += 1;
  const email = overrides.email || `chw${Date.now()}${counter}@example.com`;

  const res = await request(app).post('/api/auth/register').send({
    name: overrides.name || 'Test CHW',
    email,
    password: overrides.password || 'secret123',
  });

  if (res.status !== 201) {
    throw new Error(`Failed to create test CHW: ${res.status} ${JSON.stringify(res.body)}`);
  }

  return { token: res.body.token, user: res.body.user };
}

module.exports = { createAuthedChw };
