const { Quotation, QuotationItem, QuotationTemplate, Customer, Product, sequelize } = require('../models');

// --- TEMPLATE LOGIC ---
exports.createTemplate = async (req, res) => {
    try {
        const template = await QuotationTemplate.create(req.body);
        res.status(201).json(template);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getTemplates = async (req, res) => {
    const templates = await QuotationTemplate.findAll();
    res.json(templates);
};

// --- QUOTATION LOGIC ---
exports.createQuotation = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { 
            customerId, templateId, deliveryAddress, invoiceAddress, 
            paymentTerms, mainItems, optionalItems 
        } = req.body;

        // 1. Hitung Subtotal (Hanya dari Main Items)
        let subtotalCalc = 0;
        if (mainItems && mainItems.length > 0) {
            mainItems.forEach(item => {
                subtotalCalc += (Number(item.quantity) * Number(item.unitPrice));
            });
        }

        // 2. Hitung Pajak 11%
        const taxRate = 0.11;
        const taxAmount = subtotalCalc * taxRate;
        const total = subtotalCalc + taxAmount;

        // 3. Create Header
        const newQuotation = await Quotation.create({
            quotationNumber: `QO/${Date.now()}`,
            customerId,
            templateId,
            deliveryAddress,
            invoiceAddress,
            paymentTerms,
            subtotal: subtotalCalc,
            taxAmount: taxAmount,
            total: total,
            status: 'Draft'
        }, { transaction: t });

        // 4. Prepare Items
        const allItems = [];
        
        // Main Items
        if (mainItems) {
            mainItems.forEach(item => allItems.push({
                quotationId: newQuotation.id,
                productId: item.productId,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                subtotal: item.quantity * item.unitPrice,
                itemType: 'Main'
            }));
        }

        // Optional Items
        if (optionalItems) {
            optionalItems.forEach(item => allItems.push({
                quotationId: newQuotation.id,
                productId: item.productId,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                subtotal: item.quantity * item.unitPrice,
                itemType: 'Optional'
            }));
        }

        await QuotationItem.bulkCreate(allItems, { transaction: t });
        await t.commit();
        
        res.status(201).json({ msg: 'Quotation Created', data: newQuotation });

    } catch (error) {
        await t.rollback();
        res.status(500).json({ error: error.message });
    }
};

exports.getQuotations = async (req, res) => {
    const data = await Quotation.findAll({
        include: [Customer, { model: QuotationItem, include: [Product] }]
    });
    res.json(data);
};