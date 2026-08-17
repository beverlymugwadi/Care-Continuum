const Joi = require('joi');

// Each export is { body?: JoiSchema, params?: JoiSchema } for use with the
// validate() middleware -- not a Joi schema itself.

const register = {
  body: Joi.object({
    name: Joi.string().trim().min(1).required(),
    email: Joi.string().trim().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('chw', 'supervisor', 'admin'),
  }),
};

const login = {
  body: Joi.object({
    email: Joi.string().trim().email().required(),
    password: Joi.string().required(),
  }),
};

module.exports = { register, login };
