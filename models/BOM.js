const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Tabel Pivot antara Product dan Material
const BOM = sequelize.define('BOM', {
    quantityNeeded: { type: DataTypes.FLOAT, allowNull: false } // Jumlah material per 1 produk
});

module.exports = BOM;