const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
    name: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.ENUM('Storable', 'Service', 'Consumable'), defaultValue: 'Storable' },
    salePrice: { type: DataTypes.DECIMAL(15, 2) },
    cost: { type: DataTypes.DECIMAL(15, 2) },
    category: { type: DataTypes.STRING },
    internalReference: { type: DataTypes.STRING },
    
    stock: { type: DataTypes.INTEGER, defaultValue: 0 }, // Stok Gudang
    image: { type: DataTypes.STRING } // Gambar Produk
});

module.exports = Product;