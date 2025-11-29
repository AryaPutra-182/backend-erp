const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const RFQ = sequelize.define("RFQ", {
  rfqNumber: {
    type: DataTypes.STRING,
    unique: true
  },
  vendorId: DataTypes.INTEGER,
  orderDeadline: DataTypes.STRING,
  vendorReference: DataTypes.STRING,
  expectedArrival: DataTypes.STRING,
  status: {
    type: DataTypes.STRING,
    defaultValue: "Draft"
  }
},{
  tableName: "rfqs"
})
module.exports = RFQ
