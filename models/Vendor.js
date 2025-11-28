const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Vendor = sequelize.define('Vendor', {
    vendorName: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },

    address: { 
        type: DataTypes.TEXT, 
        allowNull: true 
    },

    phone: { 
        type: DataTypes.STRING, 
        allowNull: true 
    },

    email: { 
        type: DataTypes.STRING, 
        allowNull: true 
    },

    website: { 
        type: DataTypes.STRING, 
        allowNull: true 
    },

    image: { 
        type: DataTypes.STRING,
        allowNull: true 
    },

});

module.exports = Vendor;
