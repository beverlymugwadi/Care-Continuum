const Mother = require('../models/Mother');
const Child = require('../models/Child');

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
    // ancSchedule is system-generated from expectedDueDate; status/birthDetails
    // are only set via POST /mothers/:id/birth. Clients can't set these directly.
    delete updates.ancSchedule;
    delete updates.status;
    delete updates.birthDetails;

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

// POST /mothers/:id/birth
// Records the birth, marks the mother as delivered, and creates the linked
// Child record in one step.
exports.recordBirth = async (req, res, next) => {
  try {
    const { date, weight, complications, childName, sex, height } = req.body;

    if (!date || weight === undefined || !sex) {
      return res.status(400).json({
        error: 'date, weight and sex are required to record a birth',
      });
    }

    const mother = await Mother.findById(req.params.id);
    if (!mother) {
      return res.status(404).json({ error: 'Mother not found' });
    }

    if (mother.status === 'delivered') {
      return res.status(409).json({ error: 'This mother already has a recorded birth' });
    }

    mother.status = 'delivered';
    mother.birthDetails = { date, weight, complications };
    await mother.save();

    const child = await Child.create({
      name: childName || `Baby of ${mother.name}`,
      dateOfBirth: date,
      sex,
      motherId: mother._id,
      // Birth weight becomes the child's first growth history entry; height
      // is only included if it was measured and provided.
      growthHistory: [{ date, weight, height }],
    });

    res.status(201).json({ mother, child });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid mother ID' });
    }
    next(err);
  }
};
