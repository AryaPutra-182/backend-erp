const { RFQ, RFQItem, sequelize } = require('../models');

exports.createRFQ = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { vendorId, orderDeadline, shipTo, notes, items } = req.body;
        // items = [{ productId, quantity, unit, estimatedSubtotal }, ...]

        const rfqNumber = `RFQ/${new Date().getFullYear()}/${Date.now().toString().substr(-3)}`;

        const newRFQ = await RFQ.create({
            rfqNumber, vendorId, orderDeadline, shipTo, notes, status: 'Sent'
        }, { transaction: t });

        // Bulk insert items
        if (items && items.length > 0) {
            const rfqItems = items.map(item => ({
                rfqId: newRFQ.id,
                productId: item.productId,
                quantity: item.quantity,
                expectedDelivery: orderDeadline,
                estimatedSubtotal: item.estimatedSubtotal
            }));
            await RFQItem.bulkCreate(rfqItems, { transaction: t });
        }

        await t.commit();
        res.status(201).json({ msg: 'RFQ Created', data: newRFQ });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ error: error.message });
    }
};