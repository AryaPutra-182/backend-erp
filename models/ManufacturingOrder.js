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

    quantityToProduce: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    deadline: {
      type: DataTypes.DATE,
    },

    plannedStart: {
      type: DataTypes.DATE,
    },

    actualStart: {
      type: DataTypes.DATE,
    },

    actualFinish: {
      type: DataTypes.DATE,
    },

    producedQty: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },

    scrapQty: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },

    status: {
      type: DataTypes.ENUM(
        "Draft",
        "Confirmed",
        "Waiting Material",
        "In Progress",
        "Done",
        "Cancelled"
      ),
      defaultValue: "Draft",
    },
  },
  {
    tableName: "manufacturing_orders",
  }
);

module.exports = ManufacturingOrder;
