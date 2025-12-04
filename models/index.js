const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

// --- Import Models ---
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

const Department = require("./Department");
const Position = require("./Position");
const Employee = require("./Employee");
const Invoice = require("./Invoice");
const InvoiceItem = require("./InvoiceItem");
// ======================================================================
// MANUFACTURING
// ======================================================================

ManufacturingOrderMaterial.belongsTo(Product, {
  foreignKey: "productId",
  as: "product"
});

Product.hasMany(ManufacturingOrderMaterial, {
  foreignKey: "productId",
  as: "materials",
  onDelete: "CASCADE"
});

ManufacturingOrder.belongsTo(Product, {
  foreignKey: "productId",
  as: "product"
});

Product.hasMany(ManufacturingOrder, {
  foreignKey: "productId",
  as: "orders"
});

Product.belongsToMany(Material, { through: BOM, foreignKey: "productId" });
Material.belongsToMany(Product, { through: BOM, foreignKey: "materialId" });

Material.hasMany(ManufacturingOrderMaterial, { foreignKey: "materialId" });
ManufacturingOrderMaterial.belongsTo(Material, {
  foreignKey: "materialId",
  as: "material"
});
ManufacturingOrder.hasMany(ManufacturingOrderMaterial, {
  foreignKey: "manufacturingOrderId",
  as: "materials" // Alias ini PENTING karena dipanggil di Controller
});

// 2. Satu Material Order milik SATU Manufacturing Order
ManufacturingOrderMaterial.belongsTo(ManufacturingOrder, {
  foreignKey: "manufacturingOrderId",
  as: "manufacturingOrder"
});

// ======================================================================
// PROCUREMENT (RFQ -> PO)
// ======================================================================

Vendor.hasMany(RFQ, { foreignKey: "vendorId" });
RFQ.belongsTo(Vendor, { foreignKey: "vendorId" });

RFQ.hasMany(RFQItem, { foreignKey: "rfqId", onDelete: "CASCADE" });
RFQItem.belongsTo(RFQ, { foreignKey: "rfqId" });

Product.hasMany(RFQItem, { foreignKey: "productId" });
RFQItem.belongsTo(Product, { foreignKey: "productId" });

RFQ.hasOne(PurchaseOrder, { foreignKey: "rfqId" });
PurchaseOrder.belongsTo(RFQ, { foreignKey: "rfqId" });

PurchaseOrder.hasMany(PurchaseOrderItem, {
  foreignKey: "purchaseOrderId",
  onDelete: "CASCADE"
});
PurchaseOrderItem.belongsTo(PurchaseOrder, { foreignKey: "purchaseOrderId" });

Product.hasMany(PurchaseOrderItem, { foreignKey: "productId" });
PurchaseOrderItem.belongsTo(Product, { foreignKey: "productId" });

RFQItem.belongsTo(Material, { 
    foreignKey: "materialId", 
    as: "material" // Alias ini PENTING untuk controller
});
Material.hasMany(RFQItem, { foreignKey: "materialId" });

// ======================================================================
// SALES (Quotation -> Sales Order)
// ======================================================================

Customer.hasMany(Quotation, { foreignKey: "customerId" });
Quotation.belongsTo(Customer, { foreignKey: "customerId" });

Quotation.hasMany(QuotationItem, { foreignKey: "quotationId", onDelete: "CASCADE" });
QuotationItem.belongsTo(Quotation, { foreignKey: "quotationId" });

Product.hasMany(QuotationItem, { foreignKey: "productId" });
QuotationItem.belongsTo(Product, { foreignKey: "productId" });

QuotationTemplate.hasMany(Quotation, { foreignKey: "templateId" });
Quotation.belongsTo(QuotationTemplate, { foreignKey: "templateId" });

Quotation.hasOne(SalesOrder, { foreignKey: "quotationId" });
SalesOrder.belongsTo(Quotation, { foreignKey: "quotationId" });

Customer.hasMany(SalesOrder, { foreignKey: "customerId" });
SalesOrder.belongsTo(Customer, { foreignKey: "customerId" });

SalesOrder.hasMany(SalesItem, { 
  foreignKey: "salesOrderId", 
  as: "items",
  onDelete: "CASCADE"
});
SalesItem.belongsTo(SalesOrder, { foreignKey: "salesOrderId" });

Product.hasMany(SalesItem, { foreignKey: "productId" });
SalesItem.belongsTo(Product, { foreignKey: "productId" });


// ======================================================================
// DELIVERY WORKFLOW
// ======================================================================

Customer.hasMany(DeliveryOrder, { foreignKey: "customerId" });
DeliveryOrder.belongsTo(Customer, { foreignKey: "customerId" });

// Relasi SalesOrder ke DeliveryOrder
SalesOrder.hasOne(DeliveryOrder, { foreignKey: "salesOrderId", as: "deliveryOrder" });

// 👇 PERBAIKI BAGIAN INI (Tambahkan as: "salesOrder")
DeliveryOrder.belongsTo(SalesOrder, { 
  foreignKey: "salesOrderId",
  as: "salesOrder" // <--- WAJIB ADA (Huruf kecil 's') AGAR MATCH DENGAN CONTROLLER
});

DeliveryOrder.hasMany(DeliveryItem, {
  foreignKey: "deliveryOrderId",
  as: "items",
  onDelete: "CASCADE"
});
DeliveryItem.belongsTo(DeliveryOrder, { foreignKey: "deliveryOrderId" });

Product.hasMany(DeliveryItem, { foreignKey: "productId" });
DeliveryItem.belongsTo(Product, { foreignKey: "productId" });


// ======================================================================
// FINANCE (Invoice)
// ======================================================================

// ======================================================================
// FINANCE (Invoice)
// ======================================================================

// ======================================================================
// FINANCE (Invoice)
// ======================================================================

// 1. Link Customer → Invoice (INI YANG TADI KURANG & BIKIN ERROR)
Customer.hasMany(Invoice, { foreignKey: "customerId" });
Invoice.belongsTo(Customer, { foreignKey: "customerId" });

// 2. Link Sales Order → Invoice
SalesOrder.hasOne(Invoice, { foreignKey: "salesOrderId", as: "invoice" });
Invoice.belongsTo(SalesOrder, { 
  foreignKey: "salesOrderId", 
  as: "salesOrder" 
});

// 3. Link Delivery Order → Invoice
DeliveryOrder.hasOne(Invoice, { foreignKey: "deliveryOrderId", as: "invoice" });
Invoice.belongsTo(DeliveryOrder, { 
  foreignKey: "deliveryOrderId", 
  as: "deliveryOrder" 
});

// 4. Invoice Items
Invoice.hasMany(InvoiceItem, {
  foreignKey: "invoiceId",
  as: "items",
  onDelete: "CASCADE",
});
InvoiceItem.belongsTo(Invoice, { foreignKey: "invoiceId" });

// 5. Product → InvoiceItem
Product.hasMany(InvoiceItem, { foreignKey: "productId" });
InvoiceItem.belongsTo(Product, { foreignKey: "productId" });



// ======================================================================
// HR (Employee, Department, Position)
// ======================================================================

Department.hasMany(Employee, { foreignKey: "departmentId", onDelete: "SET NULL" });
Employee.belongsTo(Department, { foreignKey: "departmentId" });

Position.hasMany(Employee, { foreignKey: "positionId", onDelete: "SET NULL" });
Employee.belongsTo(Position, { foreignKey: "positionId" });

// Department Manager
Department.belongsTo(Employee, { as: "manager", foreignKey: "managerId" });

// Parent Department (recursive relationship)
Department.belongsTo(Department, { as: "parent", foreignKey: "parentId" });


// ======================================================================
// EXPORT
// ======================================================================

module.exports = {
  sequelize,
  User, Vendor, Customer,
  Product, Material, BOM,
  ManufacturingOrder, ManufacturingOrderMaterial,
  RFQ, RFQItem, PurchaseOrder, PurchaseOrderItem,
  Quotation, QuotationItem, QuotationTemplate,
  SalesOrder, SalesItem, DeliveryOrder, DeliveryItem,
  Invoice, InvoiceItem, Employee, Department, Position
};
