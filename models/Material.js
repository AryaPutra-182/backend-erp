const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Material = sequelize.define('Material', {
    name: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.ENUM('Langsung', 'Tidak Langsung'), defaultValue: 'Langsung' },
    cost: { type: DataTypes.DECIMAL(15, 2) },
    category: { type: DataTypes.STRING },
    internalReference: { type: DataTypes.STRING },
    weight: { type: DataTypes.INTEGER, defaultValue: 0 },
    image: { type: DataTypes.STRING }
});

module.exports = Material;