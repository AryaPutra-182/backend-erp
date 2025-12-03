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
const Department = require("./Department");
const Position = require("./Position");
const Employee = require("./Employee");

// ======================================================================
// RELASI MANUFACTURING
// ======================================================================

ManufacturingOrderMaterial.belongsTo(Product, { 
  foreignKey: "productId",
  as: "product" 
});

Product.hasMany(ManufacturingOrderMaterial, { 
  foreignKey: "productId",
  as: "materials" 
});

ManufacturingOrder.belongsTo(Product, {
  foreignKey: "productId",
  as: "product"
})

Product.hasMany(ManufacturingOrder, {
  foreignKey: "productId",
  as: "orders"
})

Product.belongsToMany(Material, { through: BOM, foreignKey: "productId" });
Material.belongsToMany(Product, { through: BOM, foreignKey: "materialId" });

Material.hasMany(ManufacturingOrderMaterial, { foreignKey: "materialId" });
ManufacturingOrderMaterial.belongsTo(Material, { 
  foreignKey: "materialId",
  as: "material"
});

// ======================================================================
// RELASI RFQ — FIXED — hanya ada sekali
// ======================================================================

Vendor.hasMany(RFQ, { foreignKey: "vendorId" });
RFQ.belongsTo(Vendor, { foreignKey: "vendorId" });

RFQ.hasMany(RFQItem, { foreignKey: "rfqId" });
RFQItem.belongsTo(RFQ, { foreignKey: "rfqId" });

Product.hasMany(RFQItem, { foreignKey: "productId" });
RFQItem.belongsTo(Product, { foreignKey: "productId" });

// ======================================================================
// RELASI PURCHASE ORDER
// ======================================================================

RFQ.hasOne(PurchaseOrder, { foreignKey: "rfqId" });
PurchaseOrder.belongsTo(RFQ, { foreignKey: "rfqId" });

PurchaseOrder.hasMany(PurchaseOrderItem, { foreignKey: "purchaseOrderId" });
PurchaseOrderItem.belongsTo(PurchaseOrder, { foreignKey: "purchaseOrderId" });

Product.hasMany(PurchaseOrderItem, { foreignKey: "productId" });
PurchaseOrderItem.belongsTo(Product, { foreignKey: "productId" });

// ======================================================================
// RELASI SALES
// ======================================================================

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

// ======================================================================
// RELASI DELIVERY
// ======================================================================

Customer.hasMany(DeliveryOrder, { foreignKey: "customerId" });
DeliveryOrder.belongsTo(Customer, { foreignKey: "customerId" });

SalesOrder.hasOne(DeliveryOrder, { foreignKey: "salesOrderId" });
DeliveryOrder.belongsTo(SalesOrder, { foreignKey: "salesOrderId" });

DeliveryOrder.hasMany(DeliveryItem, { foreignKey: "deliveryOrderId" });
DeliveryItem.belongsTo(DeliveryOrder, { foreignKey: "deliveryOrderId" });

Product.hasMany(DeliveryItem, { foreignKey: "productId" });
DeliveryItem.belongsTo(Product, { foreignKey: "productId" });

// ======================================================================
// RELASI FINANCE
// ======================================================================

SalesOrder.hasOne(Invoice, { foreignKey: "salesOrderId" });
Invoice.belongsTo(SalesOrder, { foreignKey: "salesOrderId" });

Invoice.hasMany(InvoiceItem, { foreignKey: "invoiceId" });
InvoiceItem.belongsTo(Invoice, { foreignKey: "invoiceId" });

Product.hasMany(InvoiceItem, { foreignKey: "productId" });
InvoiceItem.belongsTo(Product, { foreignKey: "productId" });

// Relasi Department -> Employee
Department.hasMany(Employee, { foreignKey: "departmentId" });
Employee.belongsTo(Department, { foreignKey: "departmentId" });

// Relasi Position -> Employee
Position.hasMany(Employee, { foreignKey: "positionId" });
Employee.belongsTo(Position, { foreignKey: "positionId" });

// Department Manager assign
Department.belongsTo(Employee, { as: "manager", foreignKey: "managerId" });

// Parent Department optional
Department.belongsTo(Department, { as: "parent", foreignKey: "parentId" });

// ======================================================================
// EXPORT MODEL
// ======================================================================

module.exports = {
  sequelize,
  User, Vendor, Customer,
  Product, Material, BOM,
  ManufacturingOrder, ManufacturingOrderMaterial,
  RFQ, RFQItem, PurchaseOrder, PurchaseOrderItem,
  Quotation, QuotationItem, QuotationTemplate,
  SalesOrder, SalesItem,
  DeliveryOrder, DeliveryItem,
  Invoice, InvoiceItem, Employee,
  Department,
  Position
};
