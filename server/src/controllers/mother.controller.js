const Mother = require('../models/Mother');
const Child = require('../models/Child');
const Notification = require('../models/Notification');
const { assessGrowth } = require('../utils/growthAssessment');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const notificationEngine = require('../services/notificationEngine');

exports.createMother = asyncHandler(async (req, res) => {
  const { name, age, contactNumber, location, expectedDueDate, ancVisitHistory } = req.body;

  const mother = await Mother.create({
    name,
    age,
    contactNumber,
    location,
    expectedDueDate,
    ancVisitHistory,
    // Assigned automatically to whichever CHW registers her.
    chw: req.user._id,
  });

  // Mother-facing: let her know when her first ANC visit is. Best-effort --
  // a notification failure shouldn't fail registration itself.
  await notificationEngine.notifyAncUpcoming(mother).catch((err) => {
    console.error('Failed to send registration notification:', err.message);
  });

  res.status(201).json(mother);
});

exports.getMothers = asyncHandler(async (req, res) => {
  const mothers = await Mother.find().sort({ registrationDate: -1 });
  res.status(200).json(mothers);
});

exports.getMotherById = asyncHandler(async (req, res) => {
  const mother = await Mother.findById(req.params.id);
  if (!mother) {
    throw new ApiError(404, 'Mother not found');
  }
  res.status(200).json(mother);
});

exports.updateMother = asyncHandler(async (req, res) => {
  const mother = await Mother.findById(req.params.id);
  if (!mother) {
    throw new ApiError(404, 'Mother not found');
  }

  const previousVisitCount = mother.ancVisitHistory.length;

  // Use save() rather than findByIdAndUpdate so the pre('save') hook
  // recalculates ancSchedule when expectedDueDate changes. The validator
  // already restricts req.body to editable fields only.
  Object.assign(mother, req.body);
  await mother.save();

  // A CHW logging a completed ANC visit is detected here (ancVisitHistory
  // grew), rather than needing its own endpoint -- notify the mother she
  // was checked on and what's next.
  if (mother.ancVisitHistory.length > previousVisitCount) {
    await notificationEngine.notifyAncVisitLogged(mother).catch((err) => {
      console.error('Failed to send visit-logged notification:', err.message);
    });
  }

  res.status(200).json(mother);
});

// POST /mothers/:id/birth
// Records the birth, marks the mother as delivered, and creates the linked
// Child record in one step.
exports.recordBirth = asyncHandler(async (req, res) => {
  const { date, weight, complications, childName, sex, height } = req.body;

  const mother = await Mother.findById(req.params.id);
  if (!mother) {
    throw new ApiError(404, 'Mother not found');
  }

  if (mother.status === 'delivered') {
    throw new ApiError(409, 'This mother already has a recorded birth');
  }

  mother.status = 'delivered';
  mother.birthDetails = { date, weight, complications };
  await mother.save();

  const assessment = assessGrowth({
    sex,
    dateOfBirth: date,
    measurementDate: date,
    weight,
    height,
  });

  const child = await Child.create({
    name: childName || `Baby of ${mother.name}`,
    dateOfBirth: date,
    sex,
    motherId: mother._id,
    // Birth weight becomes the child's first growth history entry; height
    // is only included if it was measured and provided.
    growthHistory: [{ date, weight, height, assessment }],
  });

  await notificationEngine.notifyBirthRecorded(mother).catch((err) => {
    console.error('Failed to send birth-recorded notification:', err.message);
  });

  res.status(201).json({ mother, child });
});

// POST /mothers/:id/health-alert
// A CHW records an important health concern or danger sign observed for
// this mother; she's notified immediately and told to seek care.
exports.recordHealthAlert = asyncHandler(async (req, res) => {
  const { description } = req.body;

  const mother = await Mother.findById(req.params.id);
  if (!mother) {
    throw new ApiError(404, 'Mother not found');
  }

  const notification = await notificationEngine.notifyDangerSign(mother, { description });

  res.status(201).json({ notification });
});

// GET /mothers/:id/notifications
// Lets a CHW see everything this mother has been notified about, and its
// delivery status.
exports.listNotifications = asyncHandler(async (req, res) => {
  const mother = await Mother.findById(req.params.id);
  if (!mother) {
    throw new ApiError(404, 'Mother not found');
  }

  const notifications = await Notification.find({ motherId: mother._id }).sort({ createdAt: -1 });
  res.status(200).json(notifications);
});

// POST /mothers/:id/notifications/:notificationId/resend
exports.resendNotification = asyncHandler(async (req, res) => {
  const mother = await Mother.findById(req.params.id);
  if (!mother) {
    throw new ApiError(404, 'Mother not found');
  }

  const notification = await Notification.findOne({
    _id: req.params.notificationId,
    motherId: mother._id,
  });
  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  await notificationEngine.resendNotification(notification, mother);

  res.status(200).json(notification);
});
