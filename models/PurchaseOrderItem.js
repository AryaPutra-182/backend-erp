const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PurchaseOrderItem = sequelize.define('PurchaseOrderItem', {
    quantity: { type: DataTypes.INTEGER },
    unitPrice: { type: DataTypes.DECIMAL(15, 2) },
    subtotal: { type: DataTypes.DECIMAL(15, 2) }
});

module.exports = PurchaseOrderItem;