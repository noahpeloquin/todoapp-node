/** ********************************************
 *This file only exists to keep sequelize happy when running migrations
 ******************************************** */
const parseDBURL = require('parse-db-url');

/** ********************************************
 * LOAD THE .ENV FILE
 ******************************************** */
const fs = require('fs-extra');

try {
  fs.statSync('.env');
  require('dotenv').config({ silent: true });
} catch (err) {}

// If the database URL is set, let's use that before going to default...
let DATABASE_URL;
if (process.env.DATABASE_URL) {
  DATABASE_URL = parseDBURL(process.env.DATABASE_URL);
} else {
  DATABASE_URL = {};
}

// Default DB configs and set up.
const db = {};
const defaults = {
  host: process.env.DB_HOST || DATABASE_URL.host,
  port: process.env.DB_PORT || DATABASE_URL.port,
  username: process.env.DB_USERNAME || DATABASE_URL.user,
  password: process.env.DB_PASSWORD || DATABASE_URL.password,
  database: process.env.DB_NAME || DATABASE_URL.database,
  dialect: process.env.DB_DIALECT || DATABASE_URL.adapter,
  logging: false,
};

/** ********************************************
 * DEVELOPMENT
 ******************************************** */
db.development = Object.assign({}, defaults, {
  host: defaults.host || '127.0.0.1',
  port: defaults.port || 8889,
  username: defaults.username || 'root',
  password: defaults.password || 'root',
  database: defaults.database || 'todo_app',
  dialect: defaults.dialect || 'mysql',
});

/** ********************************************
 * TEST
 ******************************************** */
db.test = Object.assign({}, db.development, {
  database: 'todo_app_tests',
});

/** ********************************************
 * REVIEW
 ******************************************** */
db.review = defaults;

/** ********************************************
 * STAGING
 ******************************************** */
db.staging = defaults;

/** ********************************************
 * PRODUCTION
 ******************************************** */
db.production = defaults;

// Set RDS SSL by default if Amazon RDS is being used

if (process.env.NODE_ENV === 'production') {
  if (db.production.host.includes('rds.amazonaws.com')) {
    db.production.dialectOptions = {
      ssl: 'Amazon RDS',
    };
  } else {
    db.production.dialectOptions = {
      ssl: {
        rejectUnauthorized: false, // This is needed if we're using a self-signed cert
        // You'll need to get these three from the mysql server and put them in a 'certs' directory
        // in the root of this project
        ca: fs.readFileSync(`${__dirname}/../certs/ca.pem`),
        key: fs.readFileSync(`${__dirname}/../certs/client-key.pem`),
        cert: fs.readFileSync(`${__dirname}/../certs/client-cert.pem`),
      },
    };
  }
}

/** ********************************************
 * SQLITE OVERRIDE
 ******************************************** */
if (process.env.DB_DIALECT === 'sqlite') {
  db.development = {
    dialect: 'sqlite',
    storage: process.env.SQLITE_DB || 'database.db', // can be a complete relative path to the database
    logging: false,
  };
}

module.exports = db;
