const mongoose = require('mongoose');
const { calculateAncSchedule } = require('../utils/ancSchedule');

const ancVisitSchema = new mongoose.Schema(
  {
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

const ancScheduleEntrySchema = new mongoose.Schema(
  {
    contactNumber: {
      type: Number,
      required: true,
    },
    gestationalWeek: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
  },
  { _id: false }
);

const motherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: Number,
    required: true,
    min: 0,
  },
  contactNumber: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  expectedDueDate: {
    type: Date,
    required: true,
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  ancVisitHistory: {
    type: [ancVisitSchema],
    default: [],
  },
  ancSchedule: {
    type: [ancScheduleEntrySchema],
    default: [],
  },
  status: {
    type: String,
    enum: ['pregnant', 'delivered'],
    default: 'pregnant',
  },
  birthDetails: {
    date: {
      type: Date,
    },
    // Baby's birth weight (kg), recorded at delivery.
    weight: {
      type: Number,
      min: 0,
    },
    complications: {
      type: String,
      trim: true,
    },
  },
});

// Auto-generate the recommended WHO ANC contact schedule whenever a mother
// is first registered, or whenever her expected due date changes.
motherSchema.pre('save', function generateAncSchedule() {
  if (this.isNew || this.isModified('expectedDueDate')) {
    this.ancSchedule = calculateAncSchedule(this.expectedDueDate);
  }
});

module.exports = mongoose.model('Mother', motherSchema);
