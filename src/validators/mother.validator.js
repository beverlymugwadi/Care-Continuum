const Joi = require('joi');
const { objectId } = require('./common');

const idParams = Joi.object({
  id: objectId.required(),
});

const ancVisit = Joi.object({
  date: Joi.date().required(),
  notes: Joi.string().trim().allow(''),
});

const create = {
  body: Joi.object({
    name: Joi.string().trim().min(1).required(),
    age: Joi.number().min(0).required(),
    contactNumber: Joi.string().trim().min(1).required(),
    location: Joi.string().trim().min(1).required(),
    expectedDueDate: Joi.date().required(),
    ancVisitHistory: Joi.array().items(ancVisit),
  }),
};

// Partial update: every field optional, but at least one must be present.
// System-derived fields (ancSchedule, status, birthDetails, chw) are
// deliberately not listed, so submitting them is rejected rather than
// silently ignored.
const update = {
  params: idParams,
  body: Joi.object({
    name: Joi.string().trim().min(1),
    age: Joi.number().min(0),
    contactNumber: Joi.string().trim().min(1),
    location: Joi.string().trim().min(1),
    expectedDueDate: Joi.date(),
    ancVisitHistory: Joi.array().items(ancVisit),
  }).min(1),
};

const getById = {
  params: idParams,
};

const recordBirth = {
  params: idParams,
  body: Joi.object({
    date: Joi.date().required(),
    weight: Joi.number().min(0).required(),
    sex: Joi.string().valid('male', 'female').required(),
    complications: Joi.string().trim().allow(''),
    childName: Joi.string().trim().min(1),
    height: Joi.number().min(0),
  }),
};

module.exports = { create, update, getById, recordBirth };
