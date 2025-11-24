const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DeliveryItem = sequelize.define('DeliveryItem', {
    quantityDemand: { type: DataTypes.INTEGER }, // Jumlah yang diminta
    quantityDone: { type: DataTypes.INTEGER, defaultValue: 0 } // Jumlah yang sudah diproses
});

module.exports = DeliveryItem;