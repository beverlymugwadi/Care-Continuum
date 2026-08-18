const request = require('supertest');
const app = require('../src/app');
const { createAuthedChw } = require('./helpers/auth');

async function createMother(token, overrides = {}) {
  const res = await request(app)
    .post('/api/mothers')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Notification Test Mother',
      age: 26,
      contactNumber: '+263771112222',
      location: 'Harare',
      expectedDueDate: '2027-06-01',
      ...overrides,
    });
  return res.body;
}

function getNotifications(token, motherId) {
  return request(app)
    .get(`/api/mothers/${motherId}/notifications`)
    .set('Authorization', `Bearer ${token}`);
}

describe('Mother-facing notifications', () => {
  it('sends a welcome/upcoming-visit notification when a mother is registered', async () => {
    const { token } = await createAuthedChw();
    const mother = await createMother(token);

    const res = await getNotifications(token, mother._id);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].type).toBe('anc_upcoming');
    expect(res.body[0].status).toBe('sent');
    expect(res.body[0].message).toMatch(/next clinic visit/i);
  });

  it('notifies her when a CHW logs a completed ANC visit', async () => {
    const { token } = await createAuthedChw();
    const mother = await createMother(token);

    await request(app)
      .put(`/api/mothers/${mother._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ ancVisitHistory: [{ date: '2026-08-18', notes: 'first visit' }] });

    const res = await getNotifications(token, mother._id);
    const visitNotification = res.body.find((n) => n.dedupeKey.includes('anc-visit-1'));
    expect(visitNotification).toBeDefined();
    expect(visitNotification.message).toMatch(/thank you for attending/i);
  });

  it('notifies her when a birth is recorded', async () => {
    const { token } = await createAuthedChw();
    const mother = await createMother(token);

    await request(app)
      .post(`/api/mothers/${mother._id}/birth`)
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2027-05-28', weight: 3.2, sex: 'female', childName: 'Notif Baby' });

    const res = await getNotifications(token, mother._id);
    const birthNotification = res.body.find((n) => n.dedupeKey.endsWith(':birth'));
    expect(birthNotification).toBeDefined();
    expect(birthNotification.message).toMatch(/birth has been recorded/i);
    expect(birthNotification.message).toContain('3.2 kg');
  });

  it('notifies her about a growth entry, and separately flags a danger sign when it is underweight/stunted/wasted', async () => {
    const { token } = await createAuthedChw();
    const mother = await createMother(token);
    const birthRes = await request(app)
      .post(`/api/mothers/${mother._id}/birth`)
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2027-05-28', weight: 3.3, sex: 'male', childName: 'Growth Notif Baby' });
    const childId = birthRes.body.child._id;

    // Severely low weight/height for a 12-month-old -> flags underweight/stunting/wasting.
    await request(app)
      .post(`/api/children/${childId}/growth`)
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2028-05-28', weight: 6.0, height: 68 });

    const res = await getNotifications(token, mother._id);
    const growthNotification = res.body.find((n) => n.type === 'record_updated' && n.childId === childId);
    const dangerNotification = res.body.find((n) => n.type === 'danger_sign_alert' && n.childId === childId);

    expect(growthNotification).toBeDefined();
    expect(dangerNotification).toBeDefined();
    expect(dangerNotification.message).toMatch(/underweight/);
    expect(dangerNotification.message).toMatch(/seek care|contact your health worker/i);
  });

  it('notifies her when a vaccination is marked given', async () => {
    const { token } = await createAuthedChw();
    const mother = await createMother(token);
    const birthRes = await request(app)
      .post(`/api/mothers/${mother._id}/birth`)
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2027-05-28', weight: 3.1, sex: 'male' });
    const child = birthRes.body.child;
    const doseId = child.vaccinationRecord[0]._id;

    await request(app)
      .post(`/api/children/${child._id}/vaccinations/${doseId}/complete`)
      .set('Authorization', `Bearer ${token}`)
      .send({});

    const res = await getNotifications(token, mother._id);
    const vaxNotification = res.body.find((n) => n.dedupeKey.includes(`vaccination-${doseId}`));
    expect(vaxNotification).toBeDefined();
    expect(vaxNotification.message).toMatch(/received the/i);
  });

  it('lets a CHW record a manual health alert, which notifies the mother', async () => {
    const { token } = await createAuthedChw();
    const mother = await createMother(token);

    const res = await request(app)
      .post(`/api/mothers/${mother._id}/health-alert`)
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'severe headache and blurred vision' });

    expect(res.status).toBe(201);
    expect(res.body.notification.type).toBe('danger_sign_alert');
    expect(res.body.notification.message).toContain('severe headache and blurred vision');
  });

  it('rejects a health alert with no description', async () => {
    const { token } = await createAuthedChw();
    const mother = await createMother(token);

    const res = await request(app)
      .post(`/api/mothers/${mother._id}/health-alert`)
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it('lets a CHW resend a notification, and 404s for an unknown one', async () => {
    const { token } = await createAuthedChw();
    const mother = await createMother(token);
    const list = await getNotifications(token, mother._id);
    const notificationId = list.body[0]._id;

    const resend = await request(app)
      .post(`/api/mothers/${mother._id}/notifications/${notificationId}/resend`)
      .set('Authorization', `Bearer ${token}`);
    expect(resend.status).toBe(200);
    expect(resend.body.status).toBe('sent');

    const missing = await request(app)
      .post(`/api/mothers/${mother._id}/notifications/64f000000000000000000000/resend`)
      .set('Authorization', `Bearer ${token}`);
    expect(missing.status).toBe(404);
  });

  it('the due/overdue scan never creates duplicate notifications on repeated runs', async () => {
    const { token } = await createAuthedChw();
    const mother = await createMother(token);
    // Birth ~6 weeks ago -> some vaccination doses land in the "due soon"
    // window, others are already overdue -- exercises both scan branches.
    await request(app)
      .post(`/api/mothers/${mother._id}/birth`)
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2026-07-10', weight: 3.1, sex: 'male' });

    const first = await request(app)
      .post('/api/notifications/run-scan')
      .set('Authorization', `Bearer ${token}`);
    expect(first.status).toBe(200);
    expect(first.body.notificationsCreated).toBeGreaterThan(0);

    const second = await request(app)
      .post('/api/notifications/run-scan')
      .set('Authorization', `Bearer ${token}`);
    expect(second.body.notificationsCreated).toBe(0);

    const list = await getNotifications(token, mother._id);
    const dedupeKeys = list.body.map((n) => n.dedupeKey);
    expect(new Set(dedupeKeys).size).toBe(dedupeKeys.length); // all unique
  });

  it('returns 404 for notifications on an unknown mother', async () => {
    const { token } = await createAuthedChw();

    const res = await getNotifications(token, '64f000000000000000000000');
    expect(res.status).toBe(404);
  });
});
