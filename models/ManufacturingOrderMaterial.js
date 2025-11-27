const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ManufacturingOrderMaterial = sequelize.define(
  "ManufacturingOrderMaterial",
  {
    requiredQty: { type: DataTypes.FLOAT, allowNull: false },
    allocatedQty: { type: DataTypes.FLOAT, defaultValue: 0 },
    consumedQty: { type: DataTypes.FLOAT, defaultValue: 0 },
    status: {
      type: DataTypes.ENUM("Pending", "Allocated", "In-Use", "Completed"),
      defaultValue: "Pending"
    }
  },
  {
    tableName: "manufacturing_order_materials"
  }
);

module.exports = ManufacturingOrderMaterial;
