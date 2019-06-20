

const { PERMISSIONS_ERROR, NOT_FOUND_ERROR } = require('../constants');
const models = require('./../models/index');

const { ErrorEntry } = models;

/*
 * Logs errors appropriately. This is useful for reducing duplicate code
 * and setting different rules for logging in production, development, etc.
 *
 * @param {Error} err The error
 * @returns {void}
 */
module.exports.logError = (err) => {
  try {
    // Always log the error regardless but limit it to a reasonable amount of characters
    // This protects us if the error is really large.

    if (err && process.env.NODE_ENV !== 'test') {
      console.log(String(err).substring(0, 10000));
    }
    if (process.env.NODE_ENV === 'production') {
      // let bugsnag = require('bugsnag');
      // bugsnag.notify(new Error(err));
    }
  } catch (e) {
    // For whatever reason if something goes wrong, let's not break things
  }
};

/*
 * Responds with a general error or returns a specific error if given the correct error code
 *
 * @param {object} res The response object
 * @param {string[]} err The error object
 * @returns {void}
 */
module.exports.respondWithErrors = async (req, res, err) => {
  if (err && process.env.NODE_ENV === 'development') {
    console.dir(err);
  }

  // This allows us to get the message from an error object or just take a string
  err = err.message || err;

  if (err === PERMISSIONS_ERROR) {
    return module.exports.permissionsErrorResponse(req, res);
  } if (err === NOT_FOUND_ERROR) {
    return module.exports.notFoundErrorResponse(req, res);
  }
  // Make sure we return an array to stay consistent with the API
  if (!Array.isArray(err)) {
    err = [err];
  }

  await ErrorEntry.create({
    ip_address: req.ip,
    status: 400,
    url: req.url,
  });

  return res.status(400).json({
    errors: {
      general: err,
    },
  });
};

/*
 * Responds with an unauthorized error
 *
 * @param {object} req The request object
 * @param {object} res The response object
 * @param {string} message error message string
 * @returns {void}
 */
module.exports.unauthorizedErrorResponse = async (req, res, message = 'Unauthorized') => {
  await ErrorEntry.create({
    ip_address: req.ip,
    status: 401,
    url: req.url,
  });

  return res.status(401).send(message);
};

/*
 * Responds with a permissions error
 *
 * @param {object} res The response object
 * @param {string[]} messages Array of error message strings
 * @returns {void}
 */
module.exports.permissionsErrorResponse = async (
  req,
  res,
  messages = ['You do not have permissions to perform this action'],
) => {
  // Make sure messages is always an array
  if (!Array.isArray(messages)) {
    messages = [messages];
  }

  await ErrorEntry.create({
    ip_address: req.ip,
    status: 403,
    url: req.url,
  });

  return res.status(403).json({
    errors: {
      permissions: messages,
    },
  });
};

/*
 * Responds with a not found
 *
 * @param {object} res The response object
 * @param {string[]} messages Array of error message strings
 * @returns {void}
 */
module.exports.notFoundErrorResponse = async (req, res, messages = ['Not found']) => {
  // Make sure messages is always an array
  if (!Array.isArray(messages)) {
    messages = [messages];
  }

  await ErrorEntry.create({
    ip_address: req.ip,
    status: 404,
    url: req.url,
  });

  return res.status(404).json({
    errors: {
      message: messages,
    },
  });
};

/*
 * Responds with a validation error
 *
 * @param {object} res The response object
 * @param {object} obj The object to respond with
 * @returns {void}
 */
module.exports.validationErrorResponse = async (req, res, obj) => {
  await ErrorEntry.create({
    ip_address: req.ip,
    status: 400,
    url: req.url,
  });

  return res.status(400).json({
    errors: obj,
  });
};

// Returns errors from expressValidator in our error object format
module.exports.validatorErrors = (req, res) => {
  const errors = req.validationErrors();
  const obj = {};

  if (errors) {
    for (const arrKey in errors) {
      for (const objKey in errors[arrKey]) {
        obj[objKey] = obj[objKey] || [];
        obj[objKey].push(errors[arrKey][objKey]);
      }
    }

    return obj;
  }
  return false;
};
