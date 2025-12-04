const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const RFQItem = sequelize.define("RFQItem", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  rfqId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  
  // === PASTIKAN ADA INI ===
  materialId: {
    type: DataTypes.INTEGER,
    allowNull: true // Boleh null jika itemnya Product, tapi untuk Purchasing ini wajib
  },
  
  // Jika Anda juga pakai Product, biarkan saja
  productId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  qty: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  price: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  total: { // Optional, bisa dihitung on-fly
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  }
});

module.exports = RFQItem;