const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Material = sequelize.define('Material', {
    name: { type: DataTypes.STRING, allowNull: false },
    cost: { type: DataTypes.DECIMAL(15, 2) },
    unit: { type: DataTypes.STRING }, // e.g., kg, meter, pcs
    stock: { type: DataTypes.INTEGER, defaultValue: 0 }
});

module.exports = Material;