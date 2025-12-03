const { 
  SalesOrder, SalesItem, Product, Quotation, QuotationItem, Customer, sequelize 
} = require('../models');


// ======================== CREATE SALES ORDER MANUAL ========================
async function createSalesOrder(req, res) {
  const t = await sequelize.transaction();
  try {
    const { customerId, items } = req.body;

    if (!customerId || !items || items.length === 0) {
      return res.status(400).json({ error: "Missing customer or items" });
    }

    const subtotal = items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);
    const tax = subtotal * 0.11;
    const grandTotal = subtotal + tax;

    const order = await SalesOrder.create({
      soNumber: `SO/${Date.now()}`,
      customerId,
      subtotal,
      tax,
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



// ======================== CONVERT FROM QUOTATION ========================
async function createFromQuotation(req, res) {
  const { id } = req.params;

  console.log("🔥 Convert triggered for quotation:", id);

  const t = await sequelize.transaction();

  try {
    const quotation = await Quotation.findByPk(id, {
      include: [{ model: QuotationItem, include: [Product] }]
    });

    if (!quotation) return res.status(404).json({ msg: "Quotation not found" });

    const subtotal = quotation.QuotationItems.reduce(
      (sum, item) => sum + Number(item.subtotal ?? (item.quantity * item.unitPrice)),
      0
    );

    const tax = subtotal * 0.11;
    const grandTotal = subtotal + tax;

    const salesOrder = await SalesOrder.create({
      soNumber: `SO/${Date.now()}`,
      customerId: quotation.customerId,
      quotationId: quotation.id,
      subtotal,
      tax,
      grandTotal,
      status: "Draft",
      paymentStatus: "Unpaid"
    }, { transaction: t });

    const salesItems = quotation.QuotationItems.map(item => ({
      salesOrderId: salesOrder.id,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal
    }));

    await SalesItem.bulkCreate(salesItems, { transaction: t });

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



// ======================== CONFIRM SALES ORDER ========================
async function confirmSales(req, res) {
  const t = await sequelize.transaction();

  try {
    const order = await SalesOrder.findByPk(req.params.id, {
      include: [
        {
          model: SalesItem,
          as: "items", // harus sesuai alias model index.js
          include: [Product]
        }
      ]
    });

    if (!order) return res.status(404).json({ error: "Sales Order not found" });

    // Kurangi stok produk
    for (const item of order.items) {
      const product = await Product.findByPk(item.productId);

      if (product) {
        await product.update(
          { stock: product.stock - item.quantity },
          { transaction: t }
        );
      }
    }

    // Update status order
    order.status = "Confirmed";
    await order.save({ transaction: t });

    await t.commit();
    res.json({ msg: "✔ Order confirmed & stock updated", order });

  } catch (err) {
    await t.rollback();
    console.error("❌ Confirm error:", err);
    res.status(500).json({ error: err.message });
  }
}




// ======================== GET ALL SALES ========================
const getAllSalesOrders = async (req, res) => {
  try {
    const data = await SalesOrder.findAll({
      include: [{ model: Customer }],
      order: [['createdAt', 'DESC']]
    });

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// ======================== GET SALES ORDER BY ID ========================
const getSalesOrderById = async (req, res) => {
  try {
    const order = await SalesOrder.findByPk(req.params.id, {
      include: [
        {
          model: SalesItem,
          as: "items",
          include: [{ model: Product }]
        },
        Customer
      ]
    });

    if (!order) return res.status(404).json({ msg: "Sales Order not found" });

    res.json(order);

  } catch (err) {
    console.error("❌ error getSalesOrderById:", err);
    res.status(500).json({ error: err.message });
  }
};



// ======================== EXPORT ========================
module.exports = {
  createSalesOrder,
  createFromQuotation,
  confirmSales,
  getAllSalesOrders,
  getSalesOrderById
};
