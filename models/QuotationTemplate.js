const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QuotationTemplate = sequelize.define('QuotationTemplate', {
    templateName: { type: DataTypes.STRING, allowNull: false },
    expiresAfterDays: { type: DataTypes.INTEGER, defaultValue: 30 },
    defaultCompanyName: { type: DataTypes.STRING },
    notes: { type: DataTypes.TEXT } // Syarat & Ketentuan default
});

module.exports = QuotationTemplate;