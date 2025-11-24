const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RFQ = sequelize.define('RFQ', {
    rfqNumber: { type: DataTypes.STRING, unique: true },
    orderDeadline: { type: DataTypes.DATE },
    status: { type: DataTypes.ENUM('Draft', 'Sent', 'PO Created'), defaultValue: 'Draft' }
});

module.exports = RFQ;