const ApiError = require('../utils/ApiError');

/**
 * Builds a middleware that validates req.body and/or req.params against Joi
 * schemas, e.g. validate({ body: createMotherSchema, params: idParamSchema }).
 *
 * Unknown/disallowed keys are rejected (not silently stripped) so a client
 * gets clear feedback rather than a request that appears to succeed but
 * quietly ignored part of the payload. On failure, forwards a single 400
 * ApiError with one { field, message } entry per problem found.
 */
function validate(schemas) {
  return (req, res, next) => {
    const details = [];

    ['params', 'body'].forEach((key) => {
      const schema = schemas[key];
      if (!schema) return;

      const { error, value } = schema.validate(req[key], { abortEarly: false });
      if (error) {
        error.details.forEach((d) => {
          details.push({ field: d.path.join('.') || key, message: d.message });
        });
      } else {
        req[key] = value;
      }
    });

    if (details.length > 0) {
      return next(new ApiError(400, 'Validation failed', details));
    }

    next();
  };
}

module.exports = validate;
