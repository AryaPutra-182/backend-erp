const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SalesItem = sequelize.define('SalesItem', {
    description: { type: DataTypes.STRING },
    quantity: { type: DataTypes.INTEGER },
    unitPrice: { type: DataTypes.DECIMAL(15, 2) },
    subtotal: { type: DataTypes.DECIMAL(15, 2) }
});

module.exports = SalesItem;