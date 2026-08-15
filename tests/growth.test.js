const request = require('supertest');
const app = require('../src/app');
const { createAuthedChw } = require('./helpers/auth');

async function createChild(token) {
  const motherRes = await request(app)
    .post('/api/mothers')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Nyasha Moyo',
      age: 27,
      contactNumber: '+263775556666',
      location: 'Kwekwe',
      expectedDueDate: '2026-08-20',
    });

  const birthRes = await request(app)
    .post(`/api/mothers/${motherRes.body._id}/birth`)
    .set('Authorization', `Bearer ${token}`)
    .send({ date: '2026-08-18', weight: 3.3, sex: 'male', childName: 'Test Baby Moyo' });

  return birthRes.body.child;
}

describe('POST /api/children/:id/growth (growth logging)', () => {
  it('rejects requests with no auth token', async () => {
    const { token } = await createAuthedChw();
    const child = await createChild(token);

    const res = await request(app)
      .post(`/api/children/${child._id}/growth`)
      .send({ date: '2027-08-18', weight: 6.0 });

    expect(res.status).toBe(401);
  });

  it('rejects a payload missing weight', async () => {
    const { token } = await createAuthedChw();
    const child = await createChild(token);

    const res = await request(app)
      .post(`/api/children/${child._id}/growth`)
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2027-08-18' });

    expect(res.status).toBe(400);
    expect(res.body.details.some((d) => d.field === 'weight')).toBe(true);
  });

  it('logs a normal-range entry and does not flag any risk', async () => {
    const { token } = await createAuthedChw();
    const child = await createChild(token);

    // Median weight/height for a 24-month-old boy per the app's WHO reference table.
    const res = await request(app)
      .post(`/api/children/${child._id}/growth`)
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2028-08-18', weight: 12.2, height: 87.8 });

    expect(res.status).toBe(201);
    expect(res.body.assessment.underweight).toBe(false);
    expect(res.body.assessment.stunting).toBe(false);
    expect(res.body.assessment.wasting).toBe(false);
    expect(res.body.assessment.weightForAgeZ).toBeCloseTo(0, 1);

    // Entry is persisted on the child.
    expect(res.body.child.growthHistory).toHaveLength(2); // birth entry + this one
  });

  it('flags underweight/stunting/wasting for a measurement well below the WHO median', async () => {
    const { token } = await createAuthedChw();
    const child = await createChild(token);

    // At 12 months, WHO median for a boy is ~9.6kg / ~75.7cm; 6kg/68cm is well below.
    const res = await request(app)
      .post(`/api/children/${child._id}/growth`)
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2027-08-18', weight: 6.0, height: 68 });

    expect(res.status).toBe(201);
    expect(res.body.assessment.underweight).toBe(true);
    expect(res.body.assessment.stunting).toBe(true);
    expect(res.body.assessment.wasting).toBe(true);
    expect(res.body.assessment.weightForAgeZ).toBeLessThan(-2);
  });

  it('returns 404 for a well-formed but unknown child id', async () => {
    const { token } = await createAuthedChw();

    const res = await request(app)
      .post('/api/children/64f000000000000000000000/growth')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2027-08-18', weight: 6.0 });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Child not found');
  });
});
