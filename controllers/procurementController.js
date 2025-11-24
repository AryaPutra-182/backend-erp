const { Vendor, RFQ, RFQItem, PurchaseOrder, PurchaseOrderItem, sequelize } = require('../models');

// --- VENDOR ---
exports.createVendor = async (req, res) => {
    try {
        const uploadNPWP = req.files['uploadNPWP'] ? req.files['uploadNPWP'][0].path : null;
        const uploadSIUP = req.files['uploadSIUP'] ? req.files['uploadSIUP'][0].path : null;

        const vendor = await Vendor.create({ 
            ...req.body, 
            uploadNPWP, 
            uploadSIUP 
        });
        res.status(201).json(vendor);
    } catch (err) { res.status(500).json(err); }
};

// --- RFQ ---
exports.createRFQ = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { vendorId, items } = req.body; // items array
        const rfq = await RFQ.create({
            rfqNumber: `RFQ/${Date.now()}`,
            vendorId,
            status: 'Sent'
        }, { transaction: t });

        const rfqItems = items.map(i => ({ ...i, rfqId: rfq.id }));
        await RFQItem.bulkCreate(rfqItems, { transaction: t });

        await t.commit();
        res.status(201).json(rfq);
    } catch (err) { 
        await t.rollback(); 
        res.status(500).json(err); 
    }
};

// --- PO ---
exports.createPO = async (req, res) => {
    // Logic mirip RFQ / Sales
    // Implementasi sederhana create PO header & items
    try {
        const po = await PurchaseOrder.create({
            poNumber: `PO/${Date.now()}`,
            ...req.body
        });
        res.status(201).json(po);
    } catch(err) { res.status(500).json(err); }
};