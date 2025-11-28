const Vendor = require('../models/Vendor');

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
