module.exports = (sequelize, DataTypes) => {
    const Session = sequelize.define('Session', {
      sessionId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      uuid: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      fingerprint: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    });
  
    return Session;
  };
  