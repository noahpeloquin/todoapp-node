'use strict';
let models = require('./../models/index');
let _ = require('lodash');
let moment = require('moment');

const ErrorEntry = models.ErrorEntry;

/*
 * Blocks users who seem to be spamming the site
 */
module.exports = async function(req, res, next) {
  const TIMEFRAME = 15; // In minutes

  let errorEntries = await ErrorEntry.findAll({
    where: {
      ip_address: req.ip,
      created_at: {
        $gte: moment()
          .subtract({ minutes: TIMEFRAME })
          .format(),
      },
    },
  });

  if (!errorEntries) {
    // If no error entries, just continue on
    return next();
  } else {
    let loginErrors = _.filter(errorEntries, o => o.url.startsWith('/sign-in')) || [];
    let notFoundErrors = _.filter(errorEntries, o => o.status === 404) || [];
    let unauthorizedErrors = _.filter(errorEntries, o => o.status === 401) || [];
    let permissionErrors = _.filter(errorEntries, o => o.status === 403) || [];
    let generalErrors = _.filter(errorEntries, o => o.status === 400) || [];

    if (
      // A user can only have 10 incorrect login attempts within the timeframe
      loginErrors.length > 10 ||
      // A user can only have 50 not found errors within the timeframe
      notFoundErrors.length > 50 ||
      // A user can only have 50 unauthorized errors within the timeframe
      unauthorizedErrors.length > 50 ||
      // A user can only have 50 permissions errors within the timeframe
      permissionErrors.length > 50 ||
      // A user can only have 500 general errors within the timeframe
      // Fairly large to prevent situations where authentic users get locked out
      generalErrors.length > 500
    ) {
      return res
        .json({
          errors: {
            access:
              'Your access to this site has temporarily been revoked. If you believe this to be an error, please contact a site administrator',
          },
        })
        .status(400);
    } else {
      return next();
    }
  }
};
