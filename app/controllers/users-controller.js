'user strict';

const bcrypt = require('bcryptjs');
const { getJWT } = require('../utils/jwt-utils');
const { getXSRFToken } = require('../utils/xsrf-utils');
const { respondWithErrors, validationErrorResponse, logError } = require('../utils/error-factory');
const { PERMISSIONS_ERROR, NOT_FOUND_ERROR } = require('../constants');
const config = require('../../config/application');
const userMailer = require('../mailers/user-mailer');
const _ = require('lodash');

const { User, ErrorEntry } = require('./../models/index');

const strongParams = ['name', 'email', 'username'];
const publicParams = ['id', 'name', 'email', 'username', 'updated_at', 'created_at'];

module.exports.authenticate = async (req, res) => {
  const user = await User.findOne({
    where: {
      email: req.body.user.email.toLowerCase(),
    },
  });
  if (user === null) {
    return validationErrorResponse(req, res, {
      email: ['The email address is invalid'],
    });
  }
  return bcrypt.compare(req.body.user.password, user.password, async (err, result) => {
    if (result !== true) {
      await ErrorEntry.create({
        ip_address: req.ip,
        status: 400,
        url: req.url,
      });
      return validationErrorResponse(req, res, {
        password: ['Invalid credentials'],
      });
    }

    // We will default to the user being veried but will overied it with totp or otp checks if needed
    // This will only come into effect if the user has totp or otp enabled
    const verified = true;

    if (result && verified) {
      const xsrf_token = getXSRFToken();
      const jwt_token = getJWT({ id: user.id, xsrfToken: xsrf_token }, config.jwt.secret);
      const responseObject = {
        user: _.pick(user, publicParams),
        xsrf_token,
        jwt_token,
      };
      return res.json(responseObject);
    }
    try {
      await ErrorEntry.create({
        ip_address: req.ip,
        status: 400,
        url: req.url,
      });
      return validationErrorResponse(req, res, {
        password: ['Invalid credentials'],
      });
    } catch (err) {
      logError(err);
      return respondWithErrors(req, res, err);
    }
  });
};

module.exports.unauthenticate = (req, res) => {
  res.clearCookie('jwt_token');
  return res.json({
    success: 1,
  });
};

module.exports.create = async (req, res) => {
  try {
    const user = await User.findOne({
      where: {
        $or: [
          { email: req.body.user.email.toLowerCase() },
          { username: req.body.user.username.toLowerCase() },
        ],
      },
    });
    if (!user) {
      // Create the user
      let user = _.pick(req.body.user, strongParams);
      user.password = req.body.user.password;

      user = await User.create(user);

      // The backend no longer returns the JWT. Instead you will need to hit the sign in endpoint
      // directly after or the user will have to sign in mannually
      return res.json({
        user: _.pick(user, publicParams),
      });
    }
    return validationErrorResponse(req, res, {
      email: ['This Username or Email is already taken.'],
    });
  } catch (err) {
    logError(err);
    return respondWithErrors(req, res, err);
  }
};

module.exports.show = async (req, res, next) => {
  try {
    const the_id = req.params.id;
    const user = await User.findById(the_id);

    if (!user) {
      throw new Error(NOT_FOUND_ERROR);
    }

    return res.json({
      user: _.pick(user, publicParams),
    });
  } catch (err) {
    logError(err);
    return respondWithErrors(req, res, err);
  }
};

module.exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      throw new Error(NOT_FOUND_ERROR);
    }

    return res.json({
      user: _.pick(user, publicParams),
    });
  } catch (err) {
    logError(err);
    return respondWithErrors(req, res, err);
  }
};

module.exports.update = async (req, res) => {
  try {
    const the_id = parseInt(req.params.id, 10);
    // We will set this in case we need it later and the user's email was changed
    let initialEmail;

    const user = await User.findById(the_id);

    if (req.user.id !== user.id) {
      throw new Error(PERMISSIONS_ERROR);
    }

    initialEmail = user.email;
    Object.assign(user, _.pick(req.body.user, strongParams));

    // if request password is set, update the password (apply hashing to password as)
    if (req.body.user.password && req.body.user.password.length > 0) {
      user.password = req.body.user.password;
    }

    await user.save();

    // Send email if the user's email was changed
    if (req.body.user.email) {
      userMailer.sendEmailChangeEmail(user, initialEmail);
    }

    // Send email if the user's password was changed
    if (req.body.user.password) {
      userMailer.sendPasswordChangeEmail(user, initialEmail);
    }

    const responseObject = {
      user: _.pick(user, publicParams),
    };

    return res.json(responseObject);
  } catch (err) {
    logError(err);
    return respondWithErrors(req, res, err);
  }
};

module.exports.destroy = async (req, res) => {
  try {
    const the_id = parseInt(req.params.id, 10);

    if (req.user.id !== the_id) {
      throw new Error(PERMISSIONS_ERROR);
    }

    const user = await User.findById(the_id);

    await user.destroy();

    return res.json({
      deleted_id: the_id,
    });
  } catch (err) {
    logError(err);
    return respondWithErrors(req, res, err);
  }
};

module.exports.index = async (req, res) => {
  try {
    if (req.query.username) {
      const user = await User.findOne({
        where: {
          username: req.query.username,
        },
      });
      if (!user) {
        throw new Error(NOT_FOUND_ERROR);
      }
      return res.json({
        user: _.pick(user, publicParams),
      });
    }
    const users = await User.findAll();
    return res.json({
      users: _.map(users, user => _.pick(user, publicParams)),
    });
  } catch (err) {
    logError(err);
    return respondWithErrors(req, res, err);
  }
};
