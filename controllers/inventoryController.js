const { Product, Material } = require('../models');

// --- PRODUCT ---
exports.createProduct = async (req, res) => {
    try {
        const image = req.file ? req.file.path : null;
        const product = await Product.create({ ...req.body, image });
        res.status(201).json(product);
    } catch (err) { res.status(500).json(err); }
};

exports.getAllProducts = async (req, res) => {
    const products = await Product.findAll();
    res.json(products);
};

// --- MATERIAL ---
exports.createMaterial = async (req, res) => {
    try {
        const material = await Material.create(req.body);
        res.status(201).json(material);
    } catch (err) { res.status(500).json(err); }
};

exports.getAllMaterials = async (req, res) => {
    const materials = await Material.findAll();
    res.json(materials);
};