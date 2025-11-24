const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Quotation = sequelize.define('Quotation', {
    quotationNumber: { type: DataTypes.STRING, unique: true }, // QO/2024/001
    quotationDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    expirationDate: { type: DataTypes.DATE },
    
    paymentTerms: { type: DataTypes.STRING }, // Immediate Payment, Net 30
    deliveryAddress: { type: DataTypes.STRING },
    invoiceAddress: { type: DataTypes.STRING },

    // Keuangan
    subtotal: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
    taxAmount: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 }, // Pajak 11%
    total: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },

    status: { type: DataTypes.ENUM('Draft', 'Sent', 'Confirmed', 'Cancelled'), defaultValue: 'Draft' }
});

module.exports = Quotation;