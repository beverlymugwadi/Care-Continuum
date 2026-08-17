const Child = require('../models/Child');
const { assessGrowth } = require('../utils/growthAssessment');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

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

  res.status(200).json({ child, entry });
});
