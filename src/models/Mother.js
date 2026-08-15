const mongoose = require('mongoose');

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
});

module.exports = mongoose.model('Mother', motherSchema);
