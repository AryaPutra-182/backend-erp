const { SalesOrder, SalesItem, Product, Quotation, Customer, sequelize } = require('../models');

exports.createSalesOrder = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { customerId, transactionDate, items, quotationId } = req.body;

        let grandTotal = 0;
        items.forEach(item => grandTotal += (item.quantity * item.unitPrice));

        const newSO = await SalesOrder.create({
            soNumber: `INV/${Date.now()}`,
            customerId,
            quotationId, // Optional, jika dari quotation
            transactionDate,
            grandTotal,
            status: 'Draft'
        }, { transaction: t });

        const salesItems = items.map(item => ({
            salesOrderId: newSO.id,
            productId: item.productId,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.quantity * item.unitPrice
        }));

        await SalesItem.bulkCreate(salesItems, { transaction: t });
        await t.commit();

        res.status(201).json({ msg: 'Sales Order Created', data: newSO });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ error: error.message });
    }
};

// KONFIRMASI SALES & POTONG STOK
exports.confirmSales = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const so = await SalesOrder.findByPk(id, { include: [SalesItem] });

        if (!so) return res.status(404).json({ msg: 'Not Found' });
        if (so.status === 'Sent' || so.status === 'Done') return res.status(400).json({ msg: 'Already Processed' });

        // Loop Items & Update Stock
        for (const item of so.SalesItems) {
            const product = await Product.findByPk(item.productId);
            if (product) {
                // Cek stok cukup? (Opsional)
                // if (product.stock < item.quantity) throw new Error(`Stok ${product.name} kurang!`);
                
                await product.decrement('stock', { by: item.quantity, transaction: t });
            }
        }

        so.status = 'Sent';
        await so.save({ transaction: t });

        await t.commit();
        res.json({ msg: 'Sales Confirmed & Stock Updated' });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ error: error.message });
    }
};