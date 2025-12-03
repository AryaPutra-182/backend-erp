const { 
    Quotation, QuotationItem, QuotationTemplate, Customer, Product, sequelize 
} = require('../models');

// ---------------- TEMPLATE ----------------
exports.createTemplate = async (req, res) => {
    try {
        const template = await QuotationTemplate.create(req.body);
        res.status(201).json(template);
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
};

exports.getTemplates = async (req, res) => {
    const templates = await QuotationTemplate.findAll();
    res.json(templates);
};

// ---------------- QUOTATION ----------------
exports.createQuotation = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { 
      customerId, templateId, deliveryAddress, invoiceAddress, 
      paymentTerms, mainItems, optionalItems 
    } = req.body;

    if (!customerId)
      return res.status(400).json({ error: "Customer is required" });

    if ((!mainItems || mainItems.length === 0) &&
        (!optionalItems || optionalItems.length === 0))
      return res.status(400).json({ error: "Quotation must have at least 1 item" });

    // Hitung ulang subtotal
    const items = [...(mainItems || []), ...(optionalItems || [])];
    const subtotalCalc = items.reduce(
      (sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 
      0
    );

    const taxRate = 0.11;
    const taxAmount = subtotalCalc * taxRate;
    const grandTotal = subtotalCalc + taxAmount;

    // Simpan header quotation
    const newQuotation = await Quotation.create({
      quotationNumber: `QO/${Date.now()}`,
      customerId,
      templateId,
      deliveryAddress,
      invoiceAddress,
      paymentTerms,
      subtotal: subtotalCalc,
      taxAmount,
      grandTotal,   // <-- FIX
      status: 'Draft'
    }, { transaction: t });

    // Simpan items
    const formattedItems = items.map(item => ({
      quotationId: newQuotation.id,
      productId: item.productId,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: Number(item.quantity) * Number(item.unitPrice),
      itemType: mainItems.includes(item) ? 'Main' : 'Optional'
    }));

    await QuotationItem.bulkCreate(formattedItems, { transaction: t });
    await t.commit();

    res.status(201).json({ msg: 'Quotation Created', data: newQuotation });

  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

// ---------------- GET ----------------
exports.getQuotations = async (req, res) => {
    try {
        const data = await Quotation.findAll({
            include: [
                Customer, 
                { model: QuotationItem, include: [Product] }
            ]
        });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ---------------- UPDATE STATUS ----------------
exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowed = ["Draft", "Sent", "Converted", "Cancelled"];
        if (!allowed.includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        const q = await Quotation.findByPk(id);
        if (!q) return res.status(404).json({ error: "Not found" });

        q.status = status;
        await q.save();

        res.json({ msg: "Status updated", quotation: q });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getQuotationById = async (req, res) => {
  try {
    const quotation = await Quotation.findByPk(req.params.id, {
      include: [
        Customer,
        { model: QuotationItem, include: [Product] }
      ]
    });

    if (!quotation) return res.status(404).json({ error: "Quotation not found" });

    // Hitung ulang total
    const subtotal = quotation.QuotationItems.reduce(
      (sum, item) => sum + Number(item.subtotal),
      0
    );

    const taxAmount = subtotal * 0.11;
    const grandTotal = subtotal + taxAmount;

    res.json({
      ...quotation.toJSON(),
      subtotal,
      taxAmount,
      grandTotal
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

