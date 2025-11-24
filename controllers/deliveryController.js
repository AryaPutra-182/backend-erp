const { DeliveryOrder, DeliveryItem, Product, SalesOrder, Customer, sequelize } = require('../models');

// 1. Get Delivery Order Detail
exports.getDeliveryDetail = async (req, res) => {
    try {
        const delivery = await DeliveryOrder.findOne({
            where: { id: req.params.id },
            include: [Customer, { model: DeliveryItem, include: [Product] }]
        });
        if(!delivery) return res.status(404).json({msg: 'Delivery not found'});
        res.json(delivery);
    } catch (err) { res.status(500).json(err); }
};

// 2. Check Availability (Tombol "Check Availability")
// Mengecek apakah stok di gudang cukup untuk permintaan ini
exports.checkAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const delivery = await DeliveryOrder.findByPk(id, { include: [DeliveryItem] });

        let allAvailable = true;

        for (const item of delivery.DeliveryItems) {
            const product = await Product.findByPk(item.productId);
            // Jika stok produk < permintaan
            if (!product || product.stock < item.quantityDemand) {
                allAvailable = false;
            }
        }

        // Update status berdasarkan ketersediaan
        const newStatus = allAvailable ? 'Ready' : 'Waiting';
        await delivery.update({ status: newStatus });

        res.json({ msg: 'Availability Checked', status: newStatus });
    } catch (err) { res.status(500).json(err); }
};

// 3. Validate (Tombol "Validate") -> INI YANG MEMOTONG STOK REAL
exports.validateDelivery = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const delivery = await DeliveryOrder.findByPk(id, { include: [DeliveryItem] });

        if (delivery.status === 'Done') return res.status(400).json({msg: 'Already Validated'});

        // Loop items dan kurangi stok
        for (const item of delivery.DeliveryItems) {
            const product = await Product.findByPk(item.productId);
            
            if (product.stock < item.quantityDemand) {
                throw new Error(`Stok ${product.name} tidak cukup!`);
            }

            // Kurangi Stok
            await product.decrement('stock', { by: item.quantityDemand, transaction: t });
            
            // Update item done
            await item.update({ quantityDone: item.quantityDemand }, { transaction: t });
        }

        // Update Status Delivery
        await delivery.update({ status: 'Done' }, { transaction: t });

        await t.commit();
        res.json({ msg: 'Delivery Validated. Stock Updated.', status: 'Done' });
    } catch (err) {
        await t.rollback();
        res.status(500).json({ error: err.message });
    }
};