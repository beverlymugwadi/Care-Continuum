const request = require('supertest');
const app = require('../src/app');
const { createAuthedChw } = require('./helpers/auth');

async function createMother(token, overrides = {}) {
  const res = await request(app)
    .post('/api/mothers')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Rudo Sibanda',
      age: 29,
      contactNumber: '+263772223333',
      location: 'Bulawayo',
      expectedDueDate: '2027-01-15',
      ...overrides,
    });
  return res.body;
}

describe('POST /api/mothers/:id/birth (birth event)', () => {
  it('records the birth, marks the mother delivered, and creates a linked child', async () => {
    const { token } = await createAuthedChw();
    const mother = await createMother(token);

    const res = await request(app)
      .post(`/api/mothers/${mother._id}/birth`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        date: '2027-01-10',
        weight: 3.2,
        sex: 'female',
        complications: 'none',
        childName: 'Baby Sibanda',
      });

    expect(res.status).toBe(201);

    // Mother side
    expect(res.body.mother.status).toBe('delivered');
    expect(res.body.mother.birthDetails.weight).toBe(3.2);
    expect(res.body.mother.birthDetails.complications).toBe('none');

    // Child side
    expect(res.body.child.name).toBe('Baby Sibanda');
    expect(res.body.child.sex).toBe('female');
    expect(res.body.child.motherId).toBe(mother._id);

    // First growth entry is the birth weight, with a WHO-comparison assessment attached.
    expect(res.body.child.growthHistory).toHaveLength(1);
    expect(res.body.child.growthHistory[0].weight).toBe(3.2);
    expect(res.body.child.growthHistory[0].assessment).toBeDefined();

    // Full EPI vaccination schedule auto-generated.
    expect(res.body.child.vaccinationRecord).toHaveLength(16);
    expect(res.body.child.vaccinationRecord.every((dose) => dose.completed === false)).toBe(true);
  });

  it('defaults the child name when none is given', async () => {
    const { token } = await createAuthedChw();
    const mother = await createMother(token, { name: 'Unnamed Test Mother' });

    const res = await request(app)
      .post(`/api/mothers/${mother._id}/birth`)
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2027-01-10', weight: 3.0, sex: 'male' });

    expect(res.status).toBe(201);
    expect(res.body.child.name).toBe('Baby of Unnamed Test Mother');
  });

  it('rejects a birth payload missing sex (required to create a valid child)', async () => {
    const { token } = await createAuthedChw();
    const mother = await createMother(token);

    const res = await request(app)
      .post(`/api/mothers/${mother._id}/birth`)
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2027-01-10', weight: 3.0 });

    expect(res.status).toBe(400);
    expect(res.body.details.some((d) => d.field === 'sex')).toBe(true);
  });

  it('returns 404 for a well-formed but unknown mother id', async () => {
    const { token } = await createAuthedChw();

    const res = await request(app)
      .post('/api/mothers/64f000000000000000000000/birth')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2027-01-10', weight: 3.0, sex: 'male' });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Mother not found');
  });

  it('rejects recording a second birth for the same mother', async () => {
    const { token } = await createAuthedChw();
    const mother = await createMother(token);

    const first = await request(app)
      .post(`/api/mothers/${mother._id}/birth`)
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2027-01-10', weight: 3.0, sex: 'male' });
    expect(first.status).toBe(201);

    const second = await request(app)
      .post(`/api/mothers/${mother._id}/birth`)
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2027-01-11', weight: 3.1, sex: 'female' });

    expect(second.status).toBe(409);
    expect(second.body.error).toMatch(/already has a recorded birth/i);
  });
});
