const { Vendor } = require('../models');

exports.createVendor = async (req, res) => {
    try {
        const {
            name, tin_npwp, internalRef, currency,
            contactName, email, website,
            bankName, paymentMethod,
            uploadNPWP, uploadSIUP // Anggap ini string path file
        } = req.body;

        const newVendor = await Vendor.create({
            name, tin_npwp, internalRef, currency,
            contactName, email, website,
            bankName, paymentMethod,
            uploadNPWP, uploadSIUP,
            status: 'Aktif'
        });

        res.status(201).json({ msg: 'Vendor created', data: newVendor });
    } catch (error) {
        res.status(500).json({ msg: 'Error creating vendor', error: error.message });
    }
};

exports.getAllVendors = async (req, res) => {
    const vendors = await Vendor.findAll();
    res.json(vendors);
};