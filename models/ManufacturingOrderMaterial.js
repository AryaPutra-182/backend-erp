const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ManufacturingOrderMaterial = sequelize.define(
  "ManufacturingOrderMaterial",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Products", // Pastikan nama tabel produk benar (biasanya 'products' atau 'Products')
        key: "id"
      }
    },
    
    // === PERBAIKAN UTAMA ADA DI SINI ===
    manufacturingOrderId: {
       type: DataTypes.INTEGER,
       allowNull: true,
       references: {
          // Gunakan nama tabel fisik di database (biasanya lowercase & plural)
          // Cek file models/ManufacturingOrder.js bagian 'tableName'
          model: "manufacturing_orders", 
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
        model: "Materials", // Pastikan nama tabel material benar
        key: "id"
      }
    },
    
    requiredQty: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    
    status: {
        type: DataTypes.STRING,
        defaultValue: 'Template'
    }
  },
  {
    tableName: "manufacturing_order_materials",
    timestamps: true
  }
);

module.exports = ManufacturingOrderMaterial;