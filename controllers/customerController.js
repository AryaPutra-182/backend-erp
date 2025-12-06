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
        const { id } = req.params;
        const customer = await Customer.findByPk(id);

        if (!customer) {
            return res.status(404).json({ msg: "Customer not found" });
        }

        res.json(customer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🗑 DELETE CUSTOMER
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({ msg: 'Customer not found' });
    }

    // Cek apakah pernah dipakai di SalesOrder
    const soCount = await SalesOrder.count({ where: { customerId: id } });
    if (soCount > 0) {
      return res.status(400).json({
        msg: "Customer cannot be deleted because there are related Sales Orders"
      });
    }

    await customer.destroy();

    res.json({ msg: "Customer deleted successfully" });
  } catch (error) {
    console.error("Error delete customer:", error);
    res.status(500).json({ error: error.message });
  }
};
