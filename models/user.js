'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('member', 'facilitator'),
        allowNull: false,
        defaultValue: 'member',
      },
    },
    {
      tableName: 'Users',
    }
  );

  User.prototype.toSafeJSON = function toSafeJSON() {
    return {
      id: this.id,
      email: this.email,
      role: this.role,
    };
  };

  return User;
};
