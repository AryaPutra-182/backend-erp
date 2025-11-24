// models/index.js
const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

// --- IMPORT SEMUA MODEL ---
const User = require('./User');
const Vendor = require('./Vendor');
const Customer = require('./Customer');
const Product = require('./Product');
const Material = require('./Material');
const BOM = require('./BOM');
const ManufacturingOrder = require('./ManufacturingOrder');
const RFQ = require('./RFQ');
const RFQItem = require('./RFQItem');
const PurchaseOrder = require('./PurchaseOrder');
const PurchaseOrderItem = require('./PurchaseOrderItem');
const Quotation = require('./Quotation');
const QuotationItem = require('./QuotationItem');
const QuotationTemplate = require('./QuotationTemplate');
const SalesOrder = require('./SalesOrder');
const SalesItem = require('./SalesItem');

// --- DEFINISI RELASI (ASSOCIATIONS) ---

// 1. Inventory & Manufacturing
// Product & Material terhubung via BOM (Many-to-Many)
Product.belongsToMany(Material, { through: BOM, foreignKey: 'productId' });
Material.belongsToMany(Product, { through: BOM, foreignKey: 'materialId' });

// Manufacturing Order memproduksi Product
Product.hasMany(ManufacturingOrder, { foreignKey: 'productId' });
ManufacturingOrder.belongsTo(Product, { foreignKey: 'productId' });

// 2. Procurement (Vendor -> RFQ -> PO)
Vendor.hasMany(RFQ, { foreignKey: 'vendorId' });
RFQ.belongsTo(Vendor, { foreignKey: 'vendorId' });

RFQ.hasMany(RFQItem, { foreignKey: 'rfqId' });
RFQItem.belongsTo(RFQ, { foreignKey: 'rfqId' });

Product.hasMany(RFQItem, { foreignKey: 'productId' });
RFQItem.belongsTo(Product, { foreignKey: 'productId' });

// RFQ berlanjut ke PO
RFQ.hasOne(PurchaseOrder, { foreignKey: 'rfqId' });
PurchaseOrder.belongsTo(RFQ, { foreignKey: 'rfqId' });

PurchaseOrder.hasMany(PurchaseOrderItem, { foreignKey: 'purchaseOrderId' });
PurchaseOrderItem.belongsTo(PurchaseOrder, { foreignKey: 'purchaseOrderId' });

Product.hasMany(PurchaseOrderItem, { foreignKey: 'productId' });
PurchaseOrderItem.belongsTo(Product, { foreignKey: 'productId' });

// 3. Sales & CRM (Customer -> Quotation -> Sales)
Customer.hasMany(Quotation, { foreignKey: 'customerId' });
Quotation.belongsTo(Customer, { foreignKey: 'customerId' });

Quotation.hasMany(QuotationItem, { foreignKey: 'quotationId' });
QuotationItem.belongsTo(Quotation, { foreignKey: 'quotationId' });

// Quotation Item isinya Product
Product.hasMany(QuotationItem, { foreignKey: 'productId' });
QuotationItem.belongsTo(Product, { foreignKey: 'productId' });

// Quotation Template (Untuk fitur Template Baru)
QuotationTemplate.hasMany(Quotation, { foreignKey: 'templateId' });
Quotation.belongsTo(QuotationTemplate, { foreignKey: 'templateId' });

// Quotation berlanjut ke Sales Order
Quotation.hasOne(SalesOrder, { foreignKey: 'quotationId' });
SalesOrder.belongsTo(Quotation, { foreignKey: 'quotationId' });

Customer.hasMany(SalesOrder, { foreignKey: 'customerId' });
SalesOrder.belongsTo(Customer, { foreignKey: 'customerId' });

SalesOrder.hasMany(SalesItem, { foreignKey: 'salesOrderId' });
SalesItem.belongsTo(SalesOrder, { foreignKey: 'salesOrderId' });

Product.hasMany(SalesItem, { foreignKey: 'productId' });
SalesItem.belongsTo(Product, { foreignKey: 'productId' });

// --- EXPORT ---
module.exports = {
    sequelize,
    User, Vendor, Customer, 
    Product, Material, BOM, ManufacturingOrder,
    RFQ, RFQItem, PurchaseOrder, PurchaseOrderItem,
    Quotation, QuotationItem, QuotationTemplate,
    SalesOrder, SalesItem
};