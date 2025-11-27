module.exports = (sequelize, DataTypes) => {
  const ManufacturingOrderMaterial = sequelize.define(
    "ManufacturingOrderMaterial",
    {
      requiredQty: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      allocatedQty: {
        type: DataTypes.FLOAT,
        defaultValue: 0
      },
      consumedQty: {
        type: DataTypes.FLOAT,
        defaultValue: 0
      },
      status: {
        type: DataTypes.ENUM("Pending", "Allocated", "In-Use", "Completed"),
        defaultValue: "Pending"
      }
    },
    {
      tableName: "manufacturing_order_materials"
    }
  );

  ManufacturingOrderMaterial.associate = (models) => {
    ManufacturingOrderMaterial.belongsTo(models.ManufacturingOrder, {
      foreignKey: "manufacturingOrderId",
      onDelete: "CASCADE"
    });

    ManufacturingOrderMaterial.belongsTo(models.Material, {
      foreignKey: "materialId"
    });
  };

  return ManufacturingOrderMaterial;
};
