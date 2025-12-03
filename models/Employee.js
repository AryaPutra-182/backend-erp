const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Employee = sequelize.define("Employee", {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true },
  phone: { type: DataTypes.STRING },
  photo: { type: DataTypes.STRING },
  status: {
    type: DataTypes.ENUM("Active", "On Leave", "Resigned"),
    defaultValue: "Active"
  }
}, { tableName: "employees" });

module.exports = Employee;
