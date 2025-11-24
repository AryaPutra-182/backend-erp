const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PurchaseOrder = sequelize.define('PurchaseOrder', {
    poNumber: { type: DataTypes.STRING, unique: true },
    poDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    grandTotal: { type: DataTypes.DECIMAL(15, 2) },
    
    shippingAddress: { type: DataTypes.STRING },
    status: { type: DataTypes.ENUM('Draft', 'Confirmed', 'Received'), defaultValue: 'Draft' }
});

module.exports = PurchaseOrder;