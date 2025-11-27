const Product = require('../models/Product');

exports.createProduct = async (req, res) => {
    try {
        const {
            name,
            type,
            salePrice,
            cost,
            category,
            internalReference,
        } = req.body;

        const product = await Product.create({
            name,
            type,
            salePrice,
            cost,
            category,
            internalReference,
            image: req.file ? req.file.filename : null
        });

        res.status(201).json({ msg: 'Product created', data: product });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
