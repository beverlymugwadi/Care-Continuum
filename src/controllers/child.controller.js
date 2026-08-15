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
