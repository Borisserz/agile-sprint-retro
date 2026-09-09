'use strict';

module.exports = (sequelize, DataTypes) => {
  const ActionItem = sequelize.define(
    'ActionItem',
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      done: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      sprintId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: 'ActionItems',
    }
  );

  ActionItem.associate = (models) => {
    ActionItem.belongsTo(models.Sprint, {
      foreignKey: 'sprintId',
      as: 'sprint',
    });
  };

  return ActionItem;
};
