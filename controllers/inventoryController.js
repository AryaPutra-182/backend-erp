const { Product, Material } = require('../models');
const path = require('path');
const fs = require('fs');   

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
      where: {
        status: ['active', null]  // tampilkan yang belum punya status
      },
      order: [['createdAt', 'DESC']]
    });

    res.json(products);

  } catch (error) {
    res.status(500).json({ error: error.message });
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
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Fix file path (Windows → slash)
    let image = product.image;
    if (req.file) {
      image = req.file.path.replace(/\\/g, "/");
    }

    const { name, sku, type, salePrice, purchasePrice, quantity } = req.body;

    await product.update({
      name: name ?? product.name,
      sku: sku ?? product.sku,
      type: type ?? product.type,
      image,

      salePrice: salePrice !== undefined ? Number(salePrice || 0) : product.salePrice,
      purchasePrice: purchasePrice !== undefined ? Number(purchasePrice || 0) : product.purchasePrice,
      quantity: quantity !== undefined ? Number(quantity || 0) : product.quantity,
    });

    res.json({
      message: "Product updated successfully",
      product,
    });

  } catch (err) {
    console.error("Error Update Product:", err);
    res.status(500).json({ error: err.message });
  }
};



exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) return res.status(404).json({ msg: "Product not found" });

    res.json(product);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
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

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) return res.status(404).json({ msg: "Product not found" });

    await product.update({ status: "archived" });

    res.json({ msg: "Product archived successfully" });

  } catch (error) {
    console.error(error);

    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        msg: "Product cannot be deleted because it is linked to transactions. It has been archived instead."
      });
    }

    res.status(500).json({ error: error.message });
  }
};
