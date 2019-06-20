'user strict';

// Import the configuration for the node side application.
// eslint-disable-next-line import/order
const config = require('./config/application');

const { env } = config.app;

const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const expressValidation = require('express-validation');
const { validationErrorResponse } = require('./app/utils/error-factory');

// Checks request ip against whitelist. Ignored in local development and production.
if (env !== 'development' && env !== 'production' && env !== 'test') {
  // Add whitelisted ip's to this array.
  const whiteListIPs = [
    '50.245.252.233', // Chiedo Labs Public
    '45.55.242.76', // Chiedo Labs VPN
  ];

  app.use((req, res, next) => {
    const requestIP = req.headers['x-forwarded-for']
      || req.connection.remoteAddress
      || req.socket.remoteAddress
      || req.connection.socket.remoteAddress;

    if (whiteListIPs.indexOf(requestIP) === -1) {
      return res.send('Access denied.');
    }
    return next();
  });
}

app.use(
  cors({
    origin: config.app.corsOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    preflightContinue: false,
    credentials: true,
  }),
);
// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

if (env === 'development') {
  // Log requests to the console
  app.use(morgan('dev'));
}

// Routes
app.use(express.static(`${__dirname}/../api-resources/rest/build`));
app.get('/api-documentation', (req, res) => {
  res.sendfile(path.resolve(`${__dirname}/../api-resources/rest/build/index.html`));
});
app.use(require('./app/routes'));

app.get('*', (req, res) => {
  res.sendStatus(404);
});

/** ********************************************
 * ENV VARIABLE VALIDATION
 ******************************************** */
if (config.app.env === 'production') {
  if (config.app.secret.length < 256 || config.jwt.secret.length < 256) {
    console.dir(
      'Your configs app and jwt secret keys must be at least 256 characters long. You can generate a 256 character long key for each at the URL below:',
    );
    console.dir('https://lastpass.com/generatepassword.php');
    process.exit(1);
  }

  if (config.app.secret === config.jwt.secret) {
    console.dir('Please do not be lazy. Your secret keys in your config should not be identical.');
    process.exit(1);
  }

  if (!process.env.WEB_CLIENT_URL) {
    console.dir('Please set up your WEB_CLIENT_URL environment variable');
    process.exit(1);
  }

  if (!process.env.CORS_ORIGIN) {
    console.dir('Please set up your CORS_ORIGIN environment variable');
    process.exit(1);
  }

  if (!process.env.API_FROM_EMAIL) {
    console.dir('Please set up your API_FROM_EMAIL environment variable');
    process.exit(1);
  }

  if (!process.env.SENDGRID_APIKEY) {
    console.dir('Please set up your SENDGRID_APIKEY environment variable');
    process.exit(1);
  }
}

/** ***************************************************************
 *Catch-all Error handling Validation MUST BE LAST
 **************************************************************** */
app.use((err, req, res, next) => {
  if (err instanceof expressValidation.ValidationError) {
    // Massage the validation errors into the response we want and then return it
    const obj = {};

    for (const arrKey in err.errors) {
      obj[err.errors[arrKey].field] = err.errors[arrKey].messages;
    }

    return validationErrorResponse(req, res, obj);
  }
  if (process.env.NODE_ENV === 'development') {
    console.dir(err);
  }

  return res.status(err.status || 500).json({
    status: err.status || 500,
    message: 'Error',
  });
});

/** ********************************************
 * Spin up server
 ******************************************** */
let port;

if (env == 'test') {
  port = 0;
} else {
  port = config.app.port;
}

const server = app.listen(port, () => {
  const { port } = server.address();

  console.log(`App listening at port ${port} on Node v${process.versions.node}`);
});

module.exports = server;
