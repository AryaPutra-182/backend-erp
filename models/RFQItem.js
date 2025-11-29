const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const RFQItem = sequelize.define("RFQItem", {
  rfqId: DataTypes.INTEGER,
  productId: DataTypes.INTEGER,
  qty: DataTypes.FLOAT,
  price: DataTypes.FLOAT,
  amount: DataTypes.FLOAT
},{
  tableName: "rfqitems"
})
module.exports = RFQItem
