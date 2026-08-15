const Child = require('../models/Child');
const { assessGrowth } = require('../utils/growthAssessment');

exports.getChildById = async (req, res, next) => {
  try {
    const child = await Child.findById(req.params.id);
    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }
    res.status(200).json(child);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid child ID' });
    }
    next(err);
  }
};

// POST /children/:id/growth
// Logs a new weight/height entry and flags undernutrition risk by comparing
// it against WHO growth reference data.
exports.addGrowthRecord = async (req, res, next) => {
  try {
    const { date, weight, height } = req.body;

    if (!date || weight === undefined) {
      return res.status(400).json({ error: 'date and weight are required' });
    }

    const child = await Child.findById(req.params.id);
    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
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
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid child ID' });
    }
    next(err);
  }
};

// POST /children/:id/vaccinations/:vaccineId/complete
// Marks one dose in the auto-generated vaccination schedule as completed.
exports.completeVaccination = async (req, res, next) => {
  try {
    const { completedDate, notes } = req.body;

    const child = await Child.findById(req.params.id);
    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    const entry = child.vaccinationRecord.id(req.params.vaccineId);
    if (!entry) {
      return res.status(404).json({ error: 'Vaccination entry not found' });
    }

    if (entry.completed) {
      return res.status(409).json({ error: 'This vaccine is already marked as completed' });
    }

    entry.completed = true;
    entry.completedDate = completedDate || new Date();
    if (notes) entry.notes = notes;

    await child.save();

    res.status(200).json({ child, entry });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid child or vaccination ID' });
    }
    next(err);
  }
};
