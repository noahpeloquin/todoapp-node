module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'tasks',
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      url_path: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          is: ['^[a-zA-Z 0-9._-]*$', 'i'],
        },
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      author_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
      },
      updated_at: {
        type: DataTypes.DATE,
      },
    },
    {
      timestamps: true,
    },
  );
};
