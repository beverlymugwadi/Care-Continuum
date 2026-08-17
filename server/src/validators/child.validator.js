const Joi = require('joi');
const { objectId } = require('./common');

const idParams = Joi.object({
  id: objectId.required(),
});

const vaccinationParams = Joi.object({
  id: objectId.required(),
  vaccineId: objectId.required(),
});

const getById = {
  params: idParams,
};

const addGrowthRecord = {
  params: idParams,
  body: Joi.object({
    date: Joi.date().required(),
    weight: Joi.number().min(0).required(),
    height: Joi.number().min(0),
  }),
};

const completeVaccination = {
  params: vaccinationParams,
  body: Joi.object({
    completedDate: Joi.date(),
    notes: Joi.string().trim().allow(''),
  }),
};

module.exports = { getById, addGrowthRecord, completeVaccination };
