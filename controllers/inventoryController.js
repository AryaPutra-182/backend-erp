const { Product, Material } = require('../models');

// --- PRODUCT ---
exports.createProduct = async (req, res) => {
    try {
        // 1. Fix Path Gambar (Windows Backslash -> Slash)
        // Agar di frontend langsung bisa dibaca
        let image = null;
        if (req.file) {
            image = req.file.path.replace(/\\/g, "/"); 
        }

        // 2. Ambil data body
        const { name, sku, type, salePrice, purchasePrice, quantity } = req.body;

        // 3. Simpan ke Database
        const product = await Product.create({
            name,
            sku,
            type,
            image, // Path yang sudah dibersihkan
            salePrice: Number(salePrice || 0),
            purchasePrice: Number(purchasePrice || 0),
            
            // Masukkan Stok Awal (Inventory Adjustment sederhana)
            quantity: Number(quantity || 0), 
        });

        res.status(201).json(product);
    } catch (err) {
        console.error("Error Create Product:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            order: [['createdAt', 'DESC']] // Urutkan dari yang terbaru
        });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- MATERIAL ---
exports.createMaterial = async (req, res) => {
    try {
        const { name, type, cost, quantity, internalReference } = req.body;

        const material = await Material.create({
            name,
            type,
            internalReference,
            cost: Number(cost || 0),
            
            // Masukkan Stok Awal Material
            quantity: Number(quantity || 0), // Pastikan model Material punya kolom 'quantity'
        });

        res.status(201).json(material);
    } catch (err) {
        console.error("Error Create Material:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.getAllMaterials = async (req, res) => {
    try {
        const materials = await Material.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(materials);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};