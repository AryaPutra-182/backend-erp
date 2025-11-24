const { Product } = require('../models');

exports.createProduct = async (req, res) => {
    try {
        // Menerima data produk
        const { name, type, salePrice, cost, category, reference, notes } = req.body;
        
        const product = await Product.create({
            name, type, salePrice, cost, category, reference, notes
        });

        res.status(201).json({ msg: 'Product created', data: product });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};