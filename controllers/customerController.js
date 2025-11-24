const { Customer, SalesOrder } = require('../models');

exports.createCustomer = async (req, res) => {
    try {
        const { 
            name, customerInfo, companyName, 
            companyAddress, phoneNumber, email, jobPosition 
        } = req.body;
        
        const imageProfile = req.file ? req.file.path : null;

        const customer = await Customer.create({
            name, customerInfo, companyName,
            companyAddress, phoneNumber, email, jobPosition,
            imageProfile
        });

        res.status(201).json({ msg: 'Customer created', data: customer });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getCustomerDetail = async (req, res) => {
    try {
        const customer = await Customer.findByPk(req.params.id, {
            include: [{ model: SalesOrder }] // Include History Invoice
        });
        if (!customer) return res.status(404).json({ msg: 'Customer not found' });
        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllCustomers = async (req, res) => {
    const customers = await Customer.findAll();
    res.json(customers);
};