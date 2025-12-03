const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SalesOrder = sequelize.define("SalesOrder", {
  soNumber: { 
    type: DataTypes.STRING, 
    unique: true 
  },

  quotationId: { 
    type: DataTypes.INTEGER,
    allowNull: true 
  }, // <--- Penting agar bisa link dari quotation
  
  transactionDate: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW 
  },

  subtotal: { 
    type: DataTypes.DECIMAL(15, 2), 
    defaultValue: 0 
  },

  tax: { 
    type: DataTypes.DECIMAL(15, 2), 
    defaultValue: 0 
  },

  discount: { 
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },

  grandTotal: { 
    type: DataTypes.DECIMAL(15, 2), 
    defaultValue: 0 
  },

  paymentStatus: {
    type: DataTypes.ENUM("Unpaid", "Partial", "Paid"),
    defaultValue: "Unpaid"
  },

  deliveryStatus: {
    type: DataTypes.ENUM("Waiting", "Partial", "Delivered"),
    defaultValue: "Waiting"
  },

  status: {
    type: DataTypes.ENUM("Draft", "Confirmed", "Sent", "Closed", "Cancelled"),
    defaultValue: "Draft"
  }
});

module.exports = SalesOrder;
