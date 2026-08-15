const request = require('supertest');
const app = require('../src/app');
const { createAuthedChw } = require('./helpers/auth');

describe('POST /api/mothers (mother registration)', () => {
  it('rejects requests with no auth token', async () => {
    const res = await request(app).post('/api/mothers').send({
      name: 'Chipo Banda',
      age: 24,
      contactNumber: '+263771112222',
      location: 'Chitungwiza',
      expectedDueDate: '2027-01-15',
    });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/not authorized/i);
  });

  it('rejects a payload missing required fields', async () => {
    const { token } = await createAuthedChw();

    const res = await request(app)
      .post('/api/mothers')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Missing Fields' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
    expect(Array.isArray(res.body.details)).toBe(true);
    expect(res.body.details.length).toBeGreaterThan(0);
  });

  it('registers a mother and auto-generates her WHO ANC schedule', async () => {
    const { token, user } = await createAuthedChw();

    const res = await request(app)
      .post('/api/mothers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Chipo Banda',
        age: 24,
        contactNumber: '+263771112222',
        location: 'Chitungwiza',
        expectedDueDate: '2027-01-15',
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Chipo Banda');
    expect(res.body.status).toBe('pregnant');
    // Assigned automatically to whoever registered her, not client-supplied.
    expect(res.body.chw).toBe(user.id);

    // 8-contact WHO ANC schedule, ending on the due date itself.
    expect(res.body.ancSchedule).toHaveLength(8);
    expect(res.body.ancSchedule[7].date.slice(0, 10)).toBe('2027-01-15');
    expect(res.body.ancVisitHistory).toEqual([]);
  });

  it('rejects an attempt to set the system-derived chw field directly', async () => {
    const { token } = await createAuthedChw();

    const res = await request(app)
      .post('/api/mothers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Sneaky Registration',
        age: 24,
        contactNumber: '+263771112222',
        location: 'Chitungwiza',
        expectedDueDate: '2027-01-15',
        chw: '64f000000000000000000000',
      });

    expect(res.status).toBe(400);
    expect(res.body.details.some((d) => d.field === 'chw')).toBe(true);
  });
});
