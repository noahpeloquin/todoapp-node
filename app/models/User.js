const bcrypt = require('bcryptjs');

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'users',
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true,
        },
        set(val) {
          this.setDataValue('email', val.toLowerCase());
        },
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          is: ['^[a-zA-Z 0-9._-]*$', 'i'],
        },
        set(val) {
          this.setDataValue('username', val.toLowerCase());
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        set(val) {
          this.setDataValue('password', bcrypt.hashSync(val, 8));
        },
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
