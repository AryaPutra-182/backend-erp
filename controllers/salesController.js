const { 
  SalesOrder, SalesItem, Product, Quotation, QuotationItem, sequelize 
} = require('../models');


// ======================== 1) CREATE SALES ORDER MANUAL ========================
async function createSalesOrder(req, res) {
  const t = await sequelize.transaction();
  try {
    const { customerId, items } = req.body;

    if (!customerId || !items || items.length === 0) {
      return res.status(400).json({ error: "Missing customer or items" });
    }

    let grandTotal = items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);

    const order = await SalesOrder.create({
      soNumber: `SO/${Date.now()}`,
      customerId,
      grandTotal,
      status: "Draft",
      paymentStatus: "Unpaid"
    }, { transaction: t });

    const formattedItems = items.map(i => ({
      salesOrderId: order.id,
      productId: i.productId,
      description: i.description,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      subtotal: i.quantity * i.unitPrice
    }));

    await SalesItem.bulkCreate(formattedItems, { transaction: t });

    await t.commit();
    res.status(201).json({ msg: "Sales Order Created", salesOrder: order });

  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: err.message });
  }
}


// ======================== 2) CREATE FROM QUOTATION ========================
async function createFromQuotation(req, res) {
  const { id } = req.params;

  console.log("🔥 Convert triggered for quotation:", id);

  const t = await sequelize.transaction();

  try {
    const quotation = await Quotation.findByPk(id, {
      include: [{ model: QuotationItem, include: [Product] }]
    });

    if (!quotation) {
      return res.status(404).json({ msg: "Quotation not found" });
    }

    // 🔹 Hitung ulang subtotal dari item
    const subtotal = quotation.QuotationItems.reduce(
      (sum, item) => sum + Number(item.subtotal ?? (item.quantity * item.unitPrice)),
      0
    );

    const tax = subtotal * 0.11;
    const grandTotal = subtotal + tax;

    // 🔹 Buat Sales Order
    const salesOrder = await SalesOrder.create({
      soNumber: `SO/${new Date().getFullYear()}/${Date.now()}`,
      customerId: quotation.customerId,
      subtotal,
      tax,
      grandTotal,
      status: "Draft",
      paymentStatus: "Unpaid"
    }, { transaction: t });

    // 🔹 Copy item ke SalesItem
    const salesItems = quotation.QuotationItems.map(item => ({
      salesOrderId: salesOrder.id,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: Number(item.subtotal ?? (item.quantity * item.unitPrice))
    }));

    await SalesItem.bulkCreate(salesItems, { transaction: t });

    // 🔹 Update status quotation
    quotation.status = "Converted";
    await quotation.save({ transaction: t });

    await t.commit();

    res.json({ msg: "✔ Converted to Sales Order", salesOrder });

  } catch (err) {
    console.error("❌ Error convert:", err);
    await t.rollback();
    res.status(500).json({ error: err.message });
  }
}



// ======================== 3) CONFIRM SALES ORDER ========================
async function confirmSales(req, res) {
  const t = await sequelize.transaction();
  try {
    const so = await SalesOrder.findByPk(req.params.id, {
      include: [SalesItem]
    });

    if (!so) return res.status(404).json({ error: "Sales Order not found" });

    for (const item of so.SalesItems) {
      const product = await Product.findByPk(item.productId);
      if (product) {
        await product.decrement("stock", { by: item.quantity, transaction: t });
      }
    }

    so.status = "Confirmed";
    await so.save({ transaction: t });

    await t.commit();
    res.json({ msg: "Sales Order Confirmed & Stock Updated" });

  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: err.message });
  }
}

const getAllSalesOrders = async (req, res) => {
  try {
    const data = await SalesOrder.findAll({
      include: [{ model: require("../models/Customer") }],
      order: [['createdAt', 'DESC']]
    });

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// ======================== EXPORTS ========================
module.exports = {
  createSalesOrder,
  createFromQuotation,
  confirmSales,
  getAllSalesOrders
};
