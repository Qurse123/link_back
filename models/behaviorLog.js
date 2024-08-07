module.exports = (sequelize, DataTypes) => {
  const BehaviorLog = sequelize.define('BehaviorLog', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    details: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  BehaviorLog.associate = (models) => {
    BehaviorLog.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return BehaviorLog;
};
