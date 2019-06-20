const { unauthorizedErrorResponse } = require('../utils/error-factory');

module.exports = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next(null);
  }
  return unauthorizedErrorResponse(req, res);
};
