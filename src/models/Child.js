const mongoose = require('mongoose');

const growthRecordSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    weight: {
      type: Number,
      required: true,
      min: 0,
    },
    // Optional: not always measured at the same time as weight (e.g. birth
    // weight is often recorded before length/height is measured).
    height: {
      type: Number,
      min: 0,
    },
    // Computed against WHO growth reference data at the time this entry was
    // logged (see src/utils/growthAssessment.js). Absent for entries that
    // predate this feature.
    assessment: {
      weightForAgeZ: Number,
      heightForAgeZ: Number,
      weightForHeightZ: Number,
      underweight: Boolean,
      stunting: Boolean,
      wasting: Boolean,
    },
  },
  { _id: false }
);

const vaccinationRecordSchema = new mongoose.Schema(
  {
    vaccine: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const childSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  sex: {
    type: String,
    required: true,
    enum: ['male', 'female'],
  },
  growthHistory: {
    type: [growthRecordSchema],
    default: [],
  },
  vaccinationRecord: {
    type: [vaccinationRecordSchema],
    default: [],
  },
  motherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mother',
    required: true,
  },
});

module.exports = mongoose.model('Child', childSchema);
