
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
    name: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.ENUM('Barang', 'Makanan', 'Layanan'), defaultValue: 'Barang' },
    salePrice: { type: DataTypes.DECIMAL(15, 2) },
    cost: { type: DataTypes.DECIMAL(15, 2) },
    category: { type: DataTypes.STRING },
    internalReference: { type: DataTypes.STRING },
    image: { type: DataTypes.STRING }
});

module.exports = Product;
