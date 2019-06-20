const csrf = require('csrf');

/*
 * Returns an Xsrf token
 * @param {Object} user
 * @returns {string}
 */
module.exports.getXSRFToken = () => {
  const tokens = new csrf();
  const secret = tokens.secretSync();
  const token = tokens.create(secret);
  return token;
};

/*
 * Returns a XSRF Token from the request if it was set
 * @param {Object} user
 * @returns {string}
 */
module.exports.getRequestXSRFToken = (req) => {
  let xsrfToken = null;

  // Check URL param for the xsrf token
  if (req.query && req.query.xsrf_token) {
    xsrfToken = req.query.xsrf_token;
  }

  // Check header for the XSRF token
  if (!xsrfToken) {
    xsrfToken = req.headers['x-xsrf-token'];
  }

  return xsrfToken;
};
