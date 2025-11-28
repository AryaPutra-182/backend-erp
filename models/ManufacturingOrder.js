const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ManufacturingOrder = sequelize.define(
  "ManufacturingOrder",
  {
    moNumber: {
      type: DataTypes.STRING,
      unique: true,
    },

    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    reference: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    quantityToProduce: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    scheduledDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    status: {
      type: DataTypes.STRING,
      defaultValue: "Draft",
    },
  },
  {
    tableName: "manufacturing_orders",
  }
);

module.exports = ManufacturingOrder;
