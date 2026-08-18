const Child = require('../models/Child');
const Mother = require('../models/Mother');
const { assessGrowth } = require('../utils/growthAssessment');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const notificationEngine = require('../services/notificationEngine');

exports.getChildById = asyncHandler(async (req, res) => {
  const child = await Child.findById(req.params.id);
  if (!child) {
    throw new ApiError(404, 'Child not found');
  }
  res.status(200).json(child);
});

// POST /children/:id/growth
// Logs a new weight/height entry and flags undernutrition risk by comparing
// it against WHO growth reference data.
exports.addGrowthRecord = asyncHandler(async (req, res) => {
  const { date, weight, height } = req.body;

  const child = await Child.findById(req.params.id);
  if (!child) {
    throw new ApiError(404, 'Child not found');
  }

  const assessment = assessGrowth({
    sex: child.sex,
    dateOfBirth: child.dateOfBirth,
    measurementDate: date,
    weight,
    height,
  });

  child.growthHistory.push({ date, weight, height, assessment });
  await child.save();

  const savedEntry = child.growthHistory[child.growthHistory.length - 1];

  const mother = await Mother.findById(child.motherId);
  if (mother) {
    await notificationEngine.notifyGrowthRecorded(mother, child, savedEntry).catch((err) => {
      console.error('Failed to send growth-recorded notification:', err.message);
    });

    // Automatic health alert: a flagged measurement is itself a "danger
    // sign" the system detected, not just a routine record update.
    const flags = [];
    if (assessment.underweight) flags.push('underweight');
    if (assessment.stunting) flags.push('stunting');
    if (assessment.wasting) flags.push('wasting');
    if (flags.length > 0) {
      await notificationEngine
        .notifyDangerSign(mother, { child, flags: flags.join(', ') })
        .catch((err) => console.error('Failed to send danger-sign notification:', err.message));
    }
  }

  res.status(201).json({ child, entry: savedEntry, assessment });
});

// POST /children/:id/vaccinations/:vaccineId/complete
// Marks one dose in the auto-generated vaccination schedule as completed.
exports.completeVaccination = asyncHandler(async (req, res) => {
  const { completedDate, notes } = req.body;

  const child = await Child.findById(req.params.id);
  if (!child) {
    throw new ApiError(404, 'Child not found');
  }

  const entry = child.vaccinationRecord.id(req.params.vaccineId);
  if (!entry) {
    throw new ApiError(404, 'Vaccination entry not found');
  }

  if (entry.completed) {
    throw new ApiError(409, 'This vaccine is already marked as completed');
  }

  entry.completed = true;
  entry.completedDate = completedDate || new Date();
  if (notes) entry.notes = notes;

  await child.save();

  const mother = await Mother.findById(child.motherId);
  if (mother) {
    await notificationEngine.notifyVaccinationRecorded(mother, child, entry).catch((err) => {
      console.error('Failed to send vaccination-recorded notification:', err.message);
    });
  }

  res.status(200).json({ child, entry });
});
