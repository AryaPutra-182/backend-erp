const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DeliveryOrder = sequelize.define('DeliveryOrder', {
    doNumber: { type: DataTypes.STRING, unique: true }, // e.g., WH/OUT/00001
    scheduledDate: { type: DataTypes.DATE },
    sourceDocument: { type: DataTypes.STRING }, // e.g., SO/2024/001
    operationType: { type: DataTypes.STRING, defaultValue: 'Delivery Orders' },
    deliveryAddress: { type: DataTypes.STRING },
    
    // Status Gudang
    status: { 
        type: DataTypes.ENUM('Draft', 'Waiting', 'Ready', 'Done', 'Cancelled'), 
        defaultValue: 'Draft' 
    }
});

module.exports = DeliveryOrder;