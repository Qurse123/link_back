module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Subscription', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    stripeCustomerId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stripeSubscriptionId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  });
};
