const { Invoice } = require('../models');

exports.createInvoice = async (req, res) => {
    try {
        const { customerName, address, email, invoiceDate, dueDate, grandTotal } = req.body;
        const invNumber = `INV/${new Date().getFullYear()}/001`;

        const newInvoice = await Invoice.create({
            invNumber, customerName, address, email,
            invoiceDate, dueDate, grandTotal,
            status: 'Draft'
        });
        
        // Note: Logic insert items invoice mirip RFQ (disederhanakan disini)

        res.status(201).json({ msg: 'Invoice Created', data: newInvoice });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};