

module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface
      .createTable('error_entries', {
        id: {
          type: Sequelize.INTEGER(11),
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        ip_address: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        status: {
          type: Sequelize.INTEGER(11),
          allowNull: false,
        },
        url: {
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
      .then(() => queryInterface.addIndex('error_entries', ['ip_address', 'url', 'status']));
  },

  down(queryInterface, Sequelize) {
    return queryInterface.dropTable('error_entries');
  },
};
