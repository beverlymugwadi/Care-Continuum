const Mother = require('../models/Mother');
const Child = require('../models/Child');
const { assessGrowth } = require('../utils/growthAssessment');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

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

  // Use save() rather than findByIdAndUpdate so the pre('save') hook
  // recalculates ancSchedule when expectedDueDate changes. The validator
  // already restricts req.body to editable fields only.
  Object.assign(mother, req.body);
  await mother.save();

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

  res.status(201).json({ mother, child });
});
