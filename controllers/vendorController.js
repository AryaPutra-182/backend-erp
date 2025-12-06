const Vendor = require('../models/Vendor');
const fs = require('fs');   // Import filesystem
const path = require('path');

exports.createVendor = async (req, res) => {
    try {
        const {
            vendorName,
            address,
            phone,
            email,
            website
        } = req.body;

        const newVendor = await Vendor.create({
            vendorName,
            address,
            phone,
            email,
            website,
            image: req.file ? req.file.filename : null
        });

        res.status(201).json({ msg: 'Vendor created', data: newVendor });

    } catch (error) {
        res.status(500).json({ msg: 'Error creating vendor', error: error.message });
    }
};

exports.getAllVendors = async (req, res) => {
    try {
        const vendors = await Vendor.findAll();
        res.json(vendors);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteVendor = async (req, res) => {
    try {
        const { id } = req.params;
        const vendor = await Vendor.findByPk(id);

        if (!vendor) {
            return res.status(404).json({ msg: 'Vendor not found' });
        }

        // 1. Hapus Foto Fisik (Jika ada)
        if (vendor.image) {
            const filePath = path.join(__dirname, '../uploads', vendor.image);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath); // Hapus file
            }
        }

        // 2. Hapus Data Database
        await vendor.destroy();

        res.json({ msg: 'Vendor deleted successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error deleting vendor', error: error.message });
    }
};
