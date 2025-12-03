const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const InvoiceItem = sequelize.define("InvoiceItem", {
  invoiceId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  unitPrice: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  subtotal: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  }
});

module.exports = InvoiceItem;