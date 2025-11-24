const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Vendor = sequelize.define('Vendor', {
    name: { type: DataTypes.STRING, allowNull: false },
    tin_npwp: { type: DataTypes.STRING },
    contactName: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING },
    address: { type: DataTypes.TEXT },
    
    // Dokumen Legalitas (Upload)
    uploadNPWP: { type: DataTypes.STRING },
    uploadSIUP: { type: DataTypes.STRING },
    
    status: { type: DataTypes.ENUM('Active', 'Inactive'), defaultValue: 'Active' }
});

module.exports = Vendor;