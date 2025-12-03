const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SalesItem = sequelize.define("SalesItem", {
  
 // fallback if product deleted
  
  quantity: { 
    type: DataTypes.INTEGER, 
    allowNull: false, 
    defaultValue: 1 
  },

  deliveredQty: {
    type: DataTypes.INTEGER,
    defaultValue: 0 // for delivery tracking
  },

  unitPrice: { 
    type: DataTypes.DECIMAL(15,2), 
    allowNull: false 
  },

  discount: {
    type: DataTypes.DECIMAL(15,2),
    defaultValue: 0
  },

  taxPercent: {
    type: DataTypes.DECIMAL(5,2),
    defaultValue: 0 // ex: 11% or VAT
  },

  subtotal: { 
    type: DataTypes.DECIMAL(15,2),
    defaultValue: 0 
  }
  
});
SalesItem.beforeSave((item) => {
  const total = item.unitPrice * item.quantity;
  const afterDiscount = total - item.discount;
  const taxAmount = (afterDiscount * item.taxPercent) / 100;

  item.subtotal = afterDiscount + taxAmount;
});

module.exports = SalesItem;
