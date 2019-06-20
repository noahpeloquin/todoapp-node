const nodemailer = require('nodemailer');
const directTransport = require('nodemailer-direct-transport');
const fs = require('fs-extra');

/** ********************************************
 * LOAD THE .ENV FILE
 ******************************************** */
// Don't load in test environment. Test environment needs to be static
if (process.env.NODE_ENV !== 'test') {
  try {
    fs.statSync('.env');
    require('dotenv').config({ silent: true });
  } catch (err) {}
}

// Converts a string to a boolean
// Useful if we pass true or false from an env var
const strToBool = (str) => {
  if (str === 'true' || str === true) {
    return true;
  }

  return false;
};

/** ********************************************
 * BASE CONFIG
 ******************************************** */
const config = {
  app: {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 8001,
    secret: process.env.SECRET || 'secret',
    webClientUrl: process.env.WEB_CLIENT_URL || 'http://localhost:4002',
    apiFromEmail: process.env.API_FROM_EMAIL || 'web@localhost.com',
    corsOrigin: process.env.CORS_ORIGIN || /.*/,
  },
  smtp: {
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: process.env.SMTP_SECURE ? strToBool(process.env.SMTP_SECURE) : true,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'secret',
  },
};

/** ********************************************
 * DEVELOPMENT
 ******************************************** */
if (config.app.env === 'development') {
  // By default only console log emails in development unless explicity asked to
  // send.
  if (process.env.SEND_DEV_EMAILS) {
    // Logs to console and emails but may go to spam
    config.mailer = nodemailer.createTransport(
      directTransport({
        debug: true,
        logger: true,
      }),
    );
  } else {
    config.mailer = {
      sendMail: (options) => {
        console.log(options.html);
      },
    };
  }
}

/** ********************************************
 * TEST
 ******************************************** */
if (config.app.env === 'test') {
  // The depths of sheoul
  config.mailer = {
    sendMail: (options) => {},
  };
}

/** ********************************************
 * REVIEW
 ******************************************** */
if (config.app.env === 'review') {
  config.mailer = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.password,
    },
  });
}

/** ********************************************
 * STAGING
 ******************************************** */
if (config.app.env === 'staging') {
  config.mailer = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.password,
    },
  });
}

/** ********************************************
 * PRODUCTION
 ******************************************** */
if (config.app.env === 'production') {
  config.mailer = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.password,
    },
  });
}

module.exports = config;
