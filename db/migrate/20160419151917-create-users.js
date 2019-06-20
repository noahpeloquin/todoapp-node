'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE(3),
      },
      updated_at: {
        type: Sequelize.DATE(3),
      },
    })
    .then(() => {
      return queryInterface.addIndex('users', ['email','username']);
    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('users');
  },
};
