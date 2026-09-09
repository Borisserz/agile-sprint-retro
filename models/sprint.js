'use strict';

module.exports = (sequelize, DataTypes) => {
  const Sprint = sequelize.define(
    'Sprint',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      goal: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('planned', 'active', 'done'),
        allowNull: false,
        defaultValue: 'planned',
      },
      capacity: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: 'Sprints',
    }
  );

  Sprint.associate = (models) => {
    Sprint.hasMany(models.ActionItem, {
      foreignKey: 'sprintId',
      as: 'actionItems',
    });
  };

  return Sprint;
};
