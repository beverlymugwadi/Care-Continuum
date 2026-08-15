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
    height: {
      type: Number,
      required: true,
      min: 0,
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
