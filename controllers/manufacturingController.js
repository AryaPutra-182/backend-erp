const { ManufacturingOrder, Product, Material, sequelize } = require('../models');

exports.createMO = async (req, res) => {
    try {
        const mo = await ManufacturingOrder.create({
            moNumber: `MO/${Date.now()}`,
            ...req.body,
            status: 'Draft'
        });
        res.status(201).json(mo);
    } catch (err) { res.status(500).json(err); }
};

exports.checkAvailability = async (req, res) => {
    try {
        // Logic simulasi cek stok material vs kebutuhan
        const { id } = req.params;
        const mo = await ManufacturingOrder.findByPk(id, {
            include: [{
                model: Product,
                include: [Material] // Ambil resep BOM
            }]
        });
        // Disini Anda bisa menambah logic perbandingan stok
        res.json(mo);
    } catch (err) { res.status(500).json(err); }
};