module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface
      .createTable('tasks', {
        id: {
          type: Sequelize.INTEGER(11),
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        url_path: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        body: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        author_id: {
          type: Sequelize.INTEGER(11),
          allowNull: false,
        },
        created_at: {
          type: Sequelize.DATE(3),
        },
        updated_at: {
          type: Sequelize.DATE(3),
        },
      })
      .then(() => queryInterface.addIndex('tasks', ['url_path', 'author_id']));
  },

  down(queryInterface, Sequelize) {
    return queryInterface.dropTable('tasks');
  },
};
