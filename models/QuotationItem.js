const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QuotationItem = sequelize.define('QuotationItem', {
    description: { type: DataTypes.STRING },
    quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
    unitPrice: { type: DataTypes.DECIMAL(15, 2) },
    subtotal: { type: DataTypes.DECIMAL(15, 2) },
    
    // Fitur Baru: Membedakan "Order Lines" (Main) vs "Optional Products"
    itemType: { 
        type: DataTypes.ENUM('Main', 'Optional'), 
        defaultValue: 'Main' 
    }
});

module.exports = QuotationItem;