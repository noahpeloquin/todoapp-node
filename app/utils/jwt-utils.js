const jwt = require('jsonwebtoken');

/*
 * Returns a valid JSON web token given a user object
 * @param {Object} data
 * @param {String} secret
 * @param {Object} opts
 * @returns {string}
 */
module.exports.getJWT = (data, secret, opts) => {
  opts = opts || {};
  // Defaults
  Object.assign(opts, { algorithm: 'HS256', expiresIn: '14d' });

  return jwt.sign(data, secret, opts);
};

/*
 * Returns a JWT from the request if it was set
 * @param {Object} user
 * @returns {string}
 */
module.exports.getRequestJWT = (req) => {
  let jwtToken = null;

  // Check header for the token
  if (!jwtToken && req.headers.authorization) {
    const x = req.headers.authorization.split(' ');
    if (x[0] === 'Bearer:' || x[0] === 'Bearer') {
      jwtToken = x[1];
    }
  }

  // Check cookie for the token
  if (!jwtToken && req.cookies) {
    jwtToken = req.cookies.jwt_token;
  }

  return jwtToken;
};
