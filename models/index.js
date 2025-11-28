const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

// --- Import Semua Model ---
const User = require("./User");
const Vendor = require("./Vendor");
const Customer = require("./Customer");
const Product = require("./Product");
const Material = require("./Material");
const BOM = require("./BOM");
const ManufacturingOrder = require("./ManufacturingOrder");
const ManufacturingOrderMaterial = require("./ManufacturingOrderMaterial");
const RFQ = require("./RFQ");
const RFQItem = require("./RFQItem");
const PurchaseOrder = require("./PurchaseOrder");
const PurchaseOrderItem = require("./PurchaseOrderItem");
const Quotation = require("./Quotation");
const QuotationItem = require("./QuotationItem");
const QuotationTemplate = require("./QuotationTemplate");
const SalesOrder = require("./SalesOrder");
const SalesItem = require("./SalesItem");
const DeliveryOrder = require("./DeliveryOrder");
const DeliveryItem = require("./DeliveryItem");
const Invoice = require("./Invoice");
const InvoiceItem = require("./InvoiceItem");
// models/index.js
ManufacturingOrderMaterial.belongsTo(Product, { 
  foreignKey: "productId",
  as: "product" 
});

Product.hasMany(ManufacturingOrderMaterial, { 
  foreignKey: "productId",
  as: "materials" 
});


// --- Product & Material via BOM ---
Product.belongsToMany(Material, { through: BOM, foreignKey: "productId" });
Material.belongsToMany(Product, { through: BOM, foreignKey: "materialId" });

// --- Manufacturing ---




Material.hasMany(ManufacturingOrderMaterial, { foreignKey: "materialId" });
ManufacturingOrderMaterial.belongsTo(Material, { 
  foreignKey: "materialId",
  as: "material"
});



// --- Procurement Flow ---
Vendor.hasMany(RFQ, { foreignKey: "vendorId" });
RFQ.belongsTo(Vendor, { foreignKey: "vendorId" });

RFQ.hasMany(RFQItem, { foreignKey: "rfqId" });
RFQItem.belongsTo(RFQ, { foreignKey: "rfqId" });

Product.hasMany(RFQItem, { foreignKey: "productId" });
RFQItem.belongsTo(Product, { foreignKey: "productId" });

RFQ.hasOne(PurchaseOrder, { foreignKey: "rfqId" });
PurchaseOrder.belongsTo(RFQ, { foreignKey: "rfqId" });

PurchaseOrder.hasMany(PurchaseOrderItem, { foreignKey: "purchaseOrderId" });
PurchaseOrderItem.belongsTo(PurchaseOrder, { foreignKey: "purchaseOrderId" });

Product.hasMany(PurchaseOrderItem, { foreignKey: "productId" });
PurchaseOrderItem.belongsTo(Product, { foreignKey: "productId" });

// --- Sales Cycle ---
Customer.hasMany(Quotation, { foreignKey: "customerId" });
Quotation.belongsTo(Customer, { foreignKey: "customerId" });

Quotation.hasMany(QuotationItem, { foreignKey: "quotationId" });
QuotationItem.belongsTo(Quotation, { foreignKey: "quotationId" });

Product.hasMany(QuotationItem, { foreignKey: "productId" });
QuotationItem.belongsTo(Product, { foreignKey: "productId" });

QuotationTemplate.hasMany(Quotation, { foreignKey: "templateId" });
Quotation.belongsTo(QuotationTemplate, { foreignKey: "templateId" });

Quotation.hasOne(SalesOrder, { foreignKey: "quotationId" });
SalesOrder.belongsTo(Quotation, { foreignKey: "quotationId" });

Customer.hasMany(SalesOrder, { foreignKey: "customerId" });
SalesOrder.belongsTo(Customer, { foreignKey: "customerId" });

SalesOrder.hasMany(SalesItem, { foreignKey: "salesOrderId" });
SalesItem.belongsTo(SalesOrder, { foreignKey: "salesOrderId" });

Product.hasMany(SalesItem, { foreignKey: "productId" });
SalesItem.belongsTo(Product, { foreignKey: "productId" });

// --- Delivery (Warehouse) ---
Customer.hasMany(DeliveryOrder, { foreignKey: "customerId" });
DeliveryOrder.belongsTo(Customer, { foreignKey: "customerId" });

SalesOrder.hasOne(DeliveryOrder, { foreignKey: "salesOrderId" });
DeliveryOrder.belongsTo(SalesOrder, { foreignKey: "salesOrderId" });

DeliveryOrder.hasMany(DeliveryItem, { foreignKey: "deliveryOrderId" });
DeliveryItem.belongsTo(DeliveryOrder, { foreignKey: "deliveryOrderId" });

Product.hasMany(DeliveryItem, { foreignKey: "productId" });
DeliveryItem.belongsTo(Product, { foreignKey: "productId" });

// --- Finance ---
SalesOrder.hasOne(Invoice, { foreignKey: "salesOrderId" });
Invoice.belongsTo(SalesOrder, { foreignKey: "salesOrderId" });

Invoice.hasMany(InvoiceItem, { foreignKey: "invoiceId" });
InvoiceItem.belongsTo(Invoice, { foreignKey: "invoiceId" });

Product.hasMany(InvoiceItem, { foreignKey: "productId" });
InvoiceItem.belongsTo(Product, { foreignKey: "productId" });
module.exports = {
  sequelize,
  User, Vendor, Customer,
  Product, Material, BOM,
  ManufacturingOrder, ManufacturingOrderMaterial,
  RFQ, RFQItem, PurchaseOrder, PurchaseOrderItem,
  Quotation, QuotationItem, QuotationTemplate,
  SalesOrder, SalesItem,
  DeliveryOrder, DeliveryItem,
  Invoice, InvoiceItem

  
};


