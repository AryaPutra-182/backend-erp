const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ManufacturingOrder = sequelize.define('ManufacturingOrder', {
    moNumber: { type: DataTypes.STRING, unique: true },
    quantityToProduce: { type: DataTypes.INTEGER, allowNull: false },
    deadline: { type: DataTypes.DATE },
    
    status: { 
        type: DataTypes.ENUM('Draft', 'Confirmed', 'In Progress', 'Done', 'Cancelled'), 
        defaultValue: 'Draft' 
    }
});

module.exports = ManufacturingOrder;