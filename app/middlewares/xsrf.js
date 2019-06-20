const { getRequestXSRFToken } = require('../utils/xsrf-utils');

// Set the xsrfToken
module.exports = function (req, res, next) {
  const xsrfToken = getRequestXSRFToken(req);

  if (xsrfToken) {
    req.xsrfToken = xsrfToken;

    return next();
  }
  return next();
};
