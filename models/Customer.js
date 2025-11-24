const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Customer = sequelize.define('Customer', {
    name: { type: DataTypes.STRING, allowNull: false }, 
    customerInfo: { type: DataTypes.TEXT },
    companyName: { type: DataTypes.STRING },
    companyAddress: { type: DataTypes.STRING }, // Dropdown alamat di UI
    
    // Kontak Detail
    phoneNumber: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    jobPosition: { type: DataTypes.STRING },
    
    // File
    imageProfile: { type: DataTypes.STRING }, // Path file upload

    status: { type: DataTypes.ENUM('Active', 'Archived'), defaultValue: 'Active' }
});

module.exports = Customer;