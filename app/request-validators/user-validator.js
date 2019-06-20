const Joi = require('joi');

const schema = Joi.object().keys({
  user: Joi.object().keys({
    name: Joi.string(),
    email: Joi.string().email(),
    username: Joi.string()
      .min(4)
      .max(20)
      .regex(/^[a-zA-Z 0-9\.\_\-]*$/i),
    // Don't say 'oh-no' and don't be overwhelmed by all the regex below this point...
    // Most validations won't require it
    password: Joi.string()
      .min(8)
      .max(16)
      // check for special character
      .regex(/[\ \!"#$%&'()*+,-\./:;<=>?\@[\]^_`{|}~]/i)
      // Check for digit
      .regex(/\d/i)
      // check for lowercas
      .regex(/[a-z]/i)
      // check for uppercase
      .regex(/[A-Z]/i),
  }),
});
// As an FYI, you can extend objects conditionally using the following
// schema = schema.concat(Joi.object({
// 'user': Joi.object().keys({
// 'coolfield': Joi.any()
// }),
// }));

module.exports = schema;
