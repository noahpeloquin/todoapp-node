const config = require('../../config/application');
const { User } = require('../models/index');
const { Strategy } = require('passport-jwt');
const { getRequestJWT } = require('../utils/jwt-utils');

/** **
 * Attach JWT passport strategy
 */
const params = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: getRequestJWT,
  passReqToCallback: true,
};

module.exports = function (passport) {
  passport.use(
    new Strategy(params, async (req, payload, done) => {
      // If the request is already authenticated don't even try. It means that
      // another authentication mechanism is being used, like Oauth, etc...
      if (req.isAuthenticated()) {
        return done();
      }

      // If there is no xsrf token then don't even try...
      if (!req.xsrfToken) {
        return done();
      }

      const user = await User.findOne({ where: { id: payload.id } });

      // Make sure the user was found and the xsrf token the user
      // sent matched the xsrf token in the JWT
      if (user && req.xsrfToken === payload.xsrfToken) {
        return done(null, user);
      }
      return done();
    }),
  );
};
