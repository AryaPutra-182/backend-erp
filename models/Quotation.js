const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Quotation = sequelize.define("Quotation", {
  qtNumber: { type: DataTypes.STRING, unique: true },
  customerId: { type: DataTypes.INTEGER, allowNull: false },
  validUntil: { type: DataTypes.DATE },
  status: { 
    type: DataTypes.ENUM("Draft", "Sent", "Converted", "Cancelled"),
    defaultValue: "Draft"
  },
  grandTotal: { type: DataTypes.DECIMAL(15,2), defaultValue: 0 }
});

module.exports = Quotation;
