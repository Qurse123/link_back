module.exports = (sequelize, DataTypes) => {
  const Token = sequelize.define('Token', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    used: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    boundUuid: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  Token.associate = (models) => {
    Token.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return Token;
};
