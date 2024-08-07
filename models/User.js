module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    uuid: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    fingerprint: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    emailCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isPaidUser: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  User.associate = (models) => {
    User.hasMany(models.Token, { foreignKey: 'userId' });
    User.hasMany(models.BehaviorLog, { foreignKey: 'userId' });
  };

  return User;
};
