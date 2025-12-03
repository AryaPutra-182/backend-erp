const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // Pastikan path ini benar

const Invoice = sequelize.define("Invoice", {
  invoiceNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  deliveryOrderId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  salesOrderId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  
  // Field Keuangan
  total: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  tax: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  grandTotal: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },

  status: {
    type: DataTypes.STRING,
    defaultValue: "Unpaid"
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

module.exports = Invoice;