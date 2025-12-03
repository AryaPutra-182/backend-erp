const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DeliveryOrder = sequelize.define('DeliveryOrder', {
  doNumber: { 
    type: DataTypes.STRING, 
    unique: true 
  }, // e.g., WH/OUT/00001
  
  scheduledDate: { 
    type: DataTypes.DATE 
  },
  
  sourceDocument: { 
    type: DataTypes.STRING 
  }, // e.g., SO/2024/001
  
  operationType: { 
    type: DataTypes.STRING, 
    defaultValue: 'Delivery Orders' 
  },
  
  deliveryAddress: { 
    type: DataTypes.STRING 
  },
  
  // Tambahkan salesOrderId agar relasi foreign key jelas
  salesOrderId: {
    type: DataTypes.INTEGER
  },

  // Status Gudang
  status: {
    type: DataTypes.ENUM("Pending", "Waiting", "Partial", "Delivered"),
    defaultValue: "Pending"
  }
});

// 👇 BAGIAN INI YANG HILANG DAN WAJIB DITAMBAHKAN
DeliveryOrder.associate = (models) => {
  // 1. Relasi ke SalesOrder (Alias 'salesOrder' wajib huruf kecil s)
  DeliveryOrder.belongsTo(models.SalesOrder, { 
    foreignKey: 'salesOrderId', 
    as: 'salesOrder' // <--- INI SOLUSINYA
  });

  // 2. Relasi ke DeliveryItem
  DeliveryOrder.hasMany(models.DeliveryItem, { 
    foreignKey: 'deliveryOrderId', 
    as: 'items' 
  });
};

module.exports = DeliveryOrder;