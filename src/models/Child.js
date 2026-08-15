const mongoose = require('mongoose');
const { calculateVaccinationSchedule } = require('../utils/vaccinationSchedule');

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

// Note: unlike the other sub-schemas in this file, entries here keep their
// own auto-generated _id (no `{ _id: false }`) so a specific dose can be
// targeted individually, e.g. by POST /children/:id/vaccinations/:vaccineId/complete.
const vaccinationRecordSchema = new mongoose.Schema({
  vaccine: {
    type: String,
    required: true,
    trim: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedDate: {
    type: Date,
  },
  notes: {
    type: String,
    trim: true,
  },
});

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

// Auto-generate the standard EPI vaccination schedule whenever a child is
// first created (e.g. from a birth event) and no schedule was supplied.
childSchema.pre('save', function generateVaccinationSchedule() {
  if (this.isNew && this.vaccinationRecord.length === 0) {
    this.vaccinationRecord = calculateVaccinationSchedule(this.dateOfBirth);
  }
});

module.exports = mongoose.model('Child', childSchema);
