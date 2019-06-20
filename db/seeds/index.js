'use strict';
//Allow the use of more es6 features within the node project, such as es6 imports, etc.
/*
 * Only to be used in development
 */
let fs = require('fs-extra');

if(process.env.NODE_ENV !== 'production') {
  // get all seed files and use filenames to load seed data for each
  fs.readdirSync(__dirname)
  .filter((file) => {
    return (file.indexOf('.') !== 0) && (file !== 'index.js') && (file.slice(-3) === '.js');
  })
  .forEach((file) => {
    require(`./${file}`);
  });
}
