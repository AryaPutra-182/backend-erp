const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QuotationItem = sequelize.define("QuotationItem", {
  productId: { type: DataTypes.INTEGER, allowNull: false },
  description: DataTypes.STRING,
  quantity: DataTypes.INTEGER,
  unitPrice: DataTypes.DECIMAL(15,2),
  subtotal: DataTypes.DECIMAL(15,2)
});

module.exports = QuotationItem;
