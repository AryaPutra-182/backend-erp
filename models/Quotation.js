const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Quotation = sequelize.define("Quotation", {
  // --- IDENTIFIERS ---
  qtNumber: { 
    type: DataTypes.STRING, 
    unique: true,
    allowNull: false 
  },
  customerId: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  templateId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  // --- DATES ---
  validUntil: { 
    type: DataTypes.DATE,
    allowNull: true // Boleh kosong, tapi sebaiknya diisi
  },

  // --- DETAILS ---
  deliveryAddress: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  invoiceAddress: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  paymentTerms: {
    type: DataTypes.STRING,
    allowNull: true
  },

  // --- FINANCIALS ---
  subtotal: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  taxAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  grandTotal: { 
    type: DataTypes.DECIMAL(15, 2), 
    defaultValue: 0 
  },

  // --- STATUS ---
  status: { 
    type: DataTypes.ENUM("Draft", "Sent", "Converted", "Cancelled"),
    defaultValue: "Draft"
  }
});

module.exports = Quotation;