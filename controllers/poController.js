const { PurchaseOrder, RFQ } = require('../models');

exports.createPOFromRFQ = async (req, res) => {
    try {
        const { rfqId, shippingLocation, notes } = req.body;
        
        // Ambil data RFQ untuk dicopy ke PO
        const sourceRFQ = await RFQ.findByPk(rfqId);
        if(!sourceRFQ) return res.status(404).json({msg: 'RFQ not found'});

        const poNumber = `PO/${new Date().getFullYear()}/${Date.now().toString().substr(-3)}`;

        const newPO = await PurchaseOrder.create({
            poNumber,
            rfqId,
            shippingLocation,
            notes,
            status: 'Confirmed'
        });

        res.status(201).json({ msg: 'PO Created from RFQ', data: newPO });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};