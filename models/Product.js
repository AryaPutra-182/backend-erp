const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
    name: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.ENUM('Barang', 'Makanan', 'Layanan'), defaultValue: 'Barang' },
    salePrice: { type: DataTypes.DECIMAL(15, 2) },
    cost: { type: DataTypes.DECIMAL(15, 2) },
    category: { type: DataTypes.STRING },
    internalReference: { type: DataTypes.STRING },
    image: { type: DataTypes.STRING },
    
    // === FIX STOK BARANG JADI (FINISHED GOODS) ===
    quantity: {
        type: DataTypes.INTEGER, // Atau FLOAT/DECIMAL jika stok berupa pecahan
        defaultValue: 0
    }
});

module.exports = Product;