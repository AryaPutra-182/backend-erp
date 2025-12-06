const Product = require('../models/Product');
const fs = require('fs');   // Import library file system
const path = require('path'); // Import library path

// 1. CREATE PRODUCT (Kode Lama Kamu)
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

// 2. GET ALL PRODUCTS (Wajib ada untuk menampilkan list di frontend)
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            order: [['createdAt', 'DESC']] // Urutkan dari yang terbaru
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. GET PRODUCT BY ID (Opsional, untuk detail/edit nanti)
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ msg: "Product not found" });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. DELETE PRODUCT (WAJIB ADA untuk tombol hapus)
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({ msg: "Product not found" });
        }

        // --- Logika Hapus Gambar Fisik ---
        // Jika produk punya gambar, hapus filenya dari folder 'uploads' atau 'public'
        if (product.image) {
            // Sesuaikan path ini dengan tempat kamu menyimpan file
            // Misal: project-root/uploads/nama-file.jpg
            const imagePath = path.join(__dirname, '../uploads', product.image); 
            // Atau jika di public: path.join(__dirname, '../public', product.image);
            
            // Cek apakah file ada, lalu hapus
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        // ----------------------------------

        await product.destroy(); // Hapus data dari database

        res.json({ msg: "Product deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};