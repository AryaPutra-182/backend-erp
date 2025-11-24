const { Invoice, InvoiceItem, SalesOrder, SalesItem, Customer, sequelize } = require('../models');

// 1. Create Invoice dari Sales Order (Otomatis mengisi form)
exports.createInvoiceFromSO = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { salesOrderId, invoiceDate, dueDate, paymentTerms } = req.body;
        
        // Ambil data Sales Order sumber
        const so = await SalesOrder.findByPk(salesOrderId, { include: [SalesItem, Customer] });
        if (!so) return res.status(404).json({msg: 'SO not found'});

        // Buat Header Invoice
        const newInvoice = await Invoice.create({
            invNumber: `INV/${new Date().getFullYear()}/${Date.now().toString().slice(-4)}`,
            salesOrderId,
            customerId: so.customerId,
            invoiceDate: invoiceDate || new Date(),
            dueDate,
            paymentTerms,
            currency: 'IDR',
            customerAddress: so.companyAddress, // Asumsi ada field ini di SO atau Customer
            subtotal: so.grandTotal, // Simplifikasi (harusnya hitung ulang sebelum pajak)
            taxAmount: so.grandTotal * 0.11, // Contoh logic pajak
            totalAmount: so.grandTotal * 1.11,
            status: 'Draft'
        }, { transaction: t });

        // Copy Items dari Sales Order ke Invoice Items
        const items = so.SalesItems.map(item => ({
            invoiceId: newInvoice.id,
            productId: item.productId,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal
        }));

        await InvoiceItem.bulkCreate(items, { transaction: t });

        await t.commit();
        res.status(201).json(newInvoice);
    } catch (err) {
        await t.rollback();
        res.status(500).json(err);
    }
};

// 2. Register Payment (Tombol "Register Payment")
exports.registerPayment = async (req, res) => {
    try {
        const { id } = req.params;
        // Disini bisa tambah logika jurnal akuntansi jika perlu
        
        await Invoice.update(
            { status: 'Paid' }, 
            { where: { id } }
        );
        res.json({ msg: 'Payment Registered. Invoice Paid.' });
    } catch (err) { res.status(500).json(err); }
};

exports.getInvoiceDetail = async (req, res) => {
    const inv = await Invoice.findByPk(req.params.id, { include: [InvoiceItem] });
    res.json(inv);
};