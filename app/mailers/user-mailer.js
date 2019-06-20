'use strict';

let config = require('../../config/application');
const mailer = config.mailer;

const from = config.app.apiFromEmail;

/*
 * Sends an email to the user on the account when his email has been changed
 * @param {Object} user the User object
 * @param {String} email the email to send the message to
 * @returns {void}
 */
module.exports.sendEmailChangeEmail = (user, email) => {
  let mailOptions = {
    from: from,
    to: email,
    subject: 'Your email address has been changed',
    html: `
    <p>Dear ${user.name}</p>
    <p>Your email address has been changed. If you made this change, you do not need to take any action.</p>
    <p>If you did not make this change, please contact support immediately</p>
    `,
  };

  //send mail with defined transport object
  mailer.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: ' + info.response);
  });
};

/*
 * Sends an email to the user on the account when his password has been changed
 * @param {Object} user the User object
 * @param {String} email the email to send the message to
 * @returns {void}
 */
module.exports.sendPasswordChangeEmail = (user, email) => {
  let mailOptions = {
    from: from,
    to: email,
    subject: 'Your password has been changed',
    html: `
    <p>Dear ${user.name}</p>
    <p>Your password has been changed. If you made this change, you do not need to take any action.</p>
    <p>If you did not make this change, please contact support immediately</p>
    `,
  };

  //send mail with defined transport object
  mailer.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: ' + info.response);
  });
};

/*
 * Sends an email to the user with a password reset link
 * @param {Object} user the User object
 * @param {String} token the reset password token
 * @returns {void}
 */
module.exports.sendPasswordResetInstructionsEmail = (user, token) => {
  let mailOptions = {
    from: from,
    to: user.email,
    subject: 'Password Reset Instructions',
    html: `
    <h1>Hi ${user.name}</h1>
    <p>
    You can reset your password at <a href="${config.app.webClientUrl}/reset-password?email=${
      user.email
    }&amp;reset_token=${token}">${config.app.webClientUrl}/reset-password?email=${
      user.email
    }&amp;reset_token=${token}</a>
    </p>
    <p>
    If you did not request a password reset, please contact support immediately.
    </p>
    `,
  };

  //send mail with defined transport object
  mailer.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: ' + info.response);
  });
};

/*
 * Sends an sms to a phone with an otp token
 * @param {Object} phone the mobile phone number
 * @param {String} token the sms mfa token
 * @returns {Promise} Needs to return Promise.
 */
module.exports.sendSMSMFAText = (phone, token) => {
  // In production, you'd want to use something like Twilio or Plivo. Should be trivial. For now, we will
  // just console.log. Obviously store your keys in an environment variable and update the config file.
  console.log(
    `Sent to ${phone}: Your security code is: ${token}. Your code expires in 5 minutes. Please do not reply.`,
  );

  return Promise.resolve();
};

/*
 * Sends an message to the user when an MFA device is activated
 * @param {Object} user the user object
 * @returns {void}
 */
module.exports.sendMFADeviceActivatedEmail = user => {
  let mailOptions = {
    from: from,
    to: user.email,
    subject: 'MFA Activated',
    html: `
    <h1>Hi ${user.name}</h1>
    <p>
    Multi-factor authentication has been activated on your account.
    </p>
    <p>
    If you did not request this change, please contact support immediately.
    </p>
    `,
  };

  //send mail with defined transport object
  mailer.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: ' + info.response);
  });
};

/*
 * Sends an message to the user when an MFA device is removed
 * @param {Object} user the user object
 * @returns {void}
 */
module.exports.sendMFADeviceDeactivationEmail = user => {
  let mailOptions = {
    from: from,
    to: user.email,
    subject: 'MFA removed',
    html: `
    <h1>Hi ${user.name}</h1>
    <p>
    Multi-factor authentication has been removed from your account.
    </p>
    <p>
    If you did not request this change, please contact support immediately.
    </p>
    `,
  };

  //send mail with defined transport object
  mailer.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: ' + info.response);
  });
};
