const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ManufacturingOrderMaterial = sequelize.define(

  "ManufacturingOrderMaterial",
  {
    uid: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Products",
        key: "id"
      }
    },
    reference: {
      type: DataTypes.STRING,
      allowNull: true
    },
    materialId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Materials",
        key: "id"
      }
    },
    requiredQty: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  },
  {
    tableName: "manufacturing_order_materials",
    timestamps: true
  }
);
module.exports = ManufacturingOrderMaterial;
