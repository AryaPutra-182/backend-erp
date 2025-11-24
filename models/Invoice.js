const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Invoice = sequelize.define('Invoice', {
    invNumber: { type: DataTypes.STRING, unique: true }, // INV/2024/001
    invoiceDate: { type: DataTypes.DATE },
    dueDate: { type: DataTypes.DATE },
    
    paymentTerms: { type: DataTypes.STRING }, // e.g., Net 30
    currency: { type: DataTypes.STRING, defaultValue: 'IDR' },
    customerAddress: { type: DataTypes.TEXT },
    
    // Financials
    subtotal: { type: DataTypes.DECIMAL(15, 2) },
    taxAmount: { type: DataTypes.DECIMAL(15, 2) },
    totalAmount: { type: DataTypes.DECIMAL(15, 2) },

    // Status Pembayaran
    status: { type: DataTypes.ENUM('Draft', 'Posted', 'Paid'), defaultValue: 'Draft' }
});

module.exports = Invoice;