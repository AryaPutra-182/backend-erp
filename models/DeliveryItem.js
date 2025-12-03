const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DeliveryItem = sequelize.define("DeliveryItem", {
  quantityDemand: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  quantityDone: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  }
});

module.exports = DeliveryItem;
