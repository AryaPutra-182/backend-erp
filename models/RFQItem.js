const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RFQItem = sequelize.define('RFQItem', {
    quantity: { type: DataTypes.INTEGER },
    expectedDelivery: { type: DataTypes.DATE },
    estimatedSubtotal: { type: DataTypes.DECIMAL(15, 2) }
});

module.exports = RFQItem;