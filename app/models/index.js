const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const JoiSequelize = require('joi-sequelize');

const basename = path.basename(module.filename);
const env = process.env.NODE_ENV || 'development';
const config = require(`${__dirname}/../../config/db.js`)[env];

const db = {};
db.validators = {};

// Set defaults for our project
Object.assign(config, {
  define: {
    underscored: true,
    underscoredAll: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

const sequelize = new Sequelize(config.database, config.username, config.password, config);

fs.readdirSync(__dirname)
  .filter(file => file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js')
  .forEach((file) => {
    const fileName = file.replace('.js', '');
    const model = sequelize.import(path.join(__dirname, file));
    // db[model.name] = model;
    db[fileName] = model;
    db.validators[fileName] = new JoiSequelize(require(path.join(__dirname, file)));
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

Object.keys(db).forEach((modelName) => {
  if (db[modelName].addScopes) {
    db[modelName].addScopes(db);
  }

  if (db[modelName].addHooks) {
    db[modelName].addHooks(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
