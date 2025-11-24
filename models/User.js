const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false }, // Simpan hash password
    role: { type: DataTypes.ENUM('Admin', 'Staff', 'Manager'), defaultValue: 'Staff' }
});

module.exports = User;