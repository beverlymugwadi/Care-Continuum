const Mother = require('../models/Mother');

exports.createMother = async (req, res, next) => {
  try {
    const { name, age, contactNumber, location, expectedDueDate, ancVisitHistory } = req.body;

    if (!name || age === undefined || !contactNumber || !location || !expectedDueDate) {
      return res.status(400).json({
        error: 'name, age, contactNumber, location and expectedDueDate are required',
      });
    }

    const mother = await Mother.create({
      name,
      age,
      contactNumber,
      location,
      expectedDueDate,
      ancVisitHistory,
    });

    res.status(201).json(mother);
  } catch (err) {
    next(err);
  }
};

exports.getMothers = async (req, res, next) => {
  try {
    const mothers = await Mother.find().sort({ registrationDate: -1 });
    res.status(200).json(mothers);
  } catch (err) {
    next(err);
  }
};

exports.getMotherById = async (req, res, next) => {
  try {
    const mother = await Mother.findById(req.params.id);
    if (!mother) {
      return res.status(404).json({ error: 'Mother not found' });
    }
    res.status(200).json(mother);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid mother ID' });
    }
    next(err);
  }
};

exports.updateMother = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    delete updates._id;
    // ancSchedule is system-generated from expectedDueDate; clients can't set it directly.
    delete updates.ancSchedule;

    const mother = await Mother.findById(req.params.id);
    if (!mother) {
      return res.status(404).json({ error: 'Mother not found' });
    }

    // Use save() rather than findByIdAndUpdate so the pre('save') hook
    // recalculates ancSchedule when expectedDueDate changes.
    Object.assign(mother, updates);
    await mother.save();

    res.status(200).json(mother);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid mother ID' });
    }
    next(err);
  }
};
