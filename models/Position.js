const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Position = sequelize.define("Position", {
  name: { type: DataTypes.STRING, allowNull: false, unique: true }
}, { tableName: "positions" });

module.exports = Position;
