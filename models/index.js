const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
});

const User = require('./User')(sequelize, DataTypes);
const Token = require('./Token')(sequelize, DataTypes);
const BehaviorLog = require('./BehaviorLog')(sequelize, DataTypes);
const Session = require('./Log')(sequelize, DataTypes);

const db = {
  User,
  Token,
  BehaviorLog,
  Session,
  sequelize,
  Sequelize,
};

module.exports = db;
