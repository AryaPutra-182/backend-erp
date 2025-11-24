const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SalesOrder = sequelize.define('SalesOrder', {
    soNumber: { type: DataTypes.STRING, unique: true }, // INV/2024/001
    transactionDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    
    grandTotal: { type: DataTypes.DECIMAL(15, 2) },
    paymentStatus: { type: DataTypes.ENUM('Unpaid', 'Partial', 'Paid'), defaultValue: 'Unpaid' },
    status: { type: DataTypes.ENUM('Draft', 'Sent', 'Done', 'Cancelled'), defaultValue: 'Draft' }
});

module.exports = SalesOrder;