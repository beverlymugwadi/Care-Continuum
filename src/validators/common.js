const Joi = require('joi');

const OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/;

// Matches a MongoDB ObjectId string. A single custom check (rather than
// chaining .hex().length(24)) so a bad value produces exactly one error
// message instead of one per failed sub-rule.
const objectId = Joi.string().custom((value, helpers) => {
  if (!OBJECT_ID_PATTERN.test(value)) {
    return helpers.error('any.invalid');
  }
  return value;
}, 'MongoDB ObjectId validation').messages({
  'any.invalid': 'must be a valid ID',
});

module.exports = { objectId };
