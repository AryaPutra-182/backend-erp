const { 
  Invoice, 
  InvoiceItem, 
  DeliveryOrder, 
  DeliveryItem, 
  SalesOrder, 
  SalesItem, 
  Product, 
  Customer, 
  sequelize 
} = require("../models");

// ================= GET ALL INVOICES =================
const getAllInvoices = async (req, res) => {
  try {
    const data = await Invoice.findAll({
      include: [
        // 1. DeliveryOrder WAJIB pakai alias 'deliveryOrder' (sesuai models/index.js)
        { 
            model: DeliveryOrder, 
            as: "deliveryOrder" 
        }, 
        
        // 2. Customer TIDAK pakai alias (karena di models/index.js tidak kita kasih 'as')
        { 
            model: Customer 
        } 
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(data);
  } catch (err) {
    console.error("❌ ERROR GET INVOICES:", err.message); // Biar kelihatan di terminal
    res.status(500).json({ error: err.message });
  }
};

// ================= GET INVOICE BY ID =================
const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [
        { model: DeliveryOrder, as: "deliveryOrder" },
        { model: Customer },
        { 
          model: InvoiceItem, 
          as: "items", 
          include: [Product] 
        }
      ]
    });

    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= CREATE INVOICE FROM DELIVERY =================
// ================= CREATE INVOICE FROM DELIVERY =================
const createFromDelivery = async (req, res) => {
  const { id } = req.params; 
  const t = await sequelize.transaction();

  try {
    console.log("🚀 START CREATE INVOICE DO ID:", id);

    // 1. Ambil Data Delivery + Items + Sales Order + SO Items
    const delivery = await DeliveryOrder.findByPk(id, {
      include: [
        { model: DeliveryItem, as: "items" }, 
        { 
          model: SalesOrder, 
          as: "salesOrder",
          include: [{ model: SalesItem, as: "items" }] 
        } 
      ]
    });

    if (!delivery) {
      await t.rollback();
      return res.status(404).json({ error: "Delivery Not Found" });
    }

    // 2. Cek Kelengkapan Data (Debug)
    if (!delivery.salesOrder) {
      console.error("❌ ERROR: Sales Order tidak ditemukan (Relasi Putus/Data Kosong)");
    } else {
      console.log("✅ Sales Order Found:", delivery.salesOrder.soNumber);
      console.log("👉 Jumlah Item di SO:", delivery.salesOrder.items.length);
    }
    console.log("👉 Jumlah Item di Delivery:", delivery.items.length);

    // 3. Buat Header Invoice
    const invoice = await Invoice.create({
      invoiceNumber: `INV/${Date.now()}`,
      deliveryOrderId: delivery.id,
      salesOrderId: delivery.salesOrderId,
      customerId: delivery.salesOrder?.customerId || null,
      status: "Unpaid",
      total: 0,
      tax: 0,
      grandTotal: 0,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30))
    }, { transaction: t });

    // 4. Hitung Items & Debugging Loop
    let subtotalAccumulated = 0;
    const invoiceItems = [];

   for (const doItem of delivery.items) {
      console.log(`\n🔍 PROCESSING ITEM ID: ${doItem.id}`);
      
      // 👇 CEK SEMUA ISI DATA ITEM BIAR KITA TAHU NAMA KOLOMNYA
      console.log("📦 DATA ITEM LENGKAP:", JSON.stringify(doItem, null, 2));

      const soItem = delivery.salesOrder?.items?.find(
        (s) => String(s.productId) === String(doItem.productId)
      );
      
      const price = soItem ? Number(soItem.unitPrice) : 0;
      
      // 👇 PERBAIKAN LOGIKA QTY
      // Prioritas: 
      // 1. quantity (standar)
      // 2. quantityDemand (jumlah permintaan)
      // 3. quantityDone (jumlah selesai/dikirim)
      // Jika semua 0 atau undefined, maka 0.
      let qty = Number(doItem.quantity || doItem.quantityDemand || doItem.quantityDone || 0);

      // FALLBACK: Jika qty masih 0, mungkin ini Delivery baru dibuat (Pending)? 
      // Ambil qty dari Sales Order aslinya (Asumsi Full Delivery)
      if (qty === 0 && soItem) {
          console.warn("⚠️ Qty di Delivery 0, mengambil dari Sales Order (Fallback).");
          qty = Number(soItem.quantity);
      }

      const subtotal = price * qty;
      
      console.log(`   👉 Price: ${price}`);
      console.log(`   👉 Qty Final: ${qty}`);
      console.log(`   👉 Subtotal: ${subtotal}`);

      subtotalAccumulated += subtotal;

      invoiceItems.push({
        invoiceId: invoice.id,
        productId: doItem.productId,
        quantity: qty,
        unitPrice: price,
        subtotal: subtotal
      });
    }
    

    console.log(`\n💰 TOTAL AKHIR: ${subtotalAccumulated}`);

    await InvoiceItem.bulkCreate(invoiceItems, { transaction: t });
    
    // 5. Update Totals
    invoice.total = subtotalAccumulated;
    invoice.tax = subtotalAccumulated * 0.11; // PPN 11%
    invoice.grandTotal = subtotalAccumulated + invoice.tax;
    
    await invoice.save({ transaction: t });

    await t.commit();
    res.status(201).json({ msg: "Invoice created", invoice });

  } catch (err) {
    await t.rollback();
    console.error("❌ Create Invoice Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ================= VALIDATE INVOICE =================
const validateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    invoice.status = "Posted"; // Atau 'Sent'
    await invoice.save();

    res.json({ msg: "Invoice validated", invoice });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updatePaymentStatus = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    invoice.status = "Paid";
    // Jika mau simpan tanggal bayar: invoice.paidAt = new Date();
    await invoice.save();

    res.json({ msg: "Invoice Paid Successfully", invoice });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllInvoices,
  getInvoiceById,
  createFromDelivery,
  validateInvoice,
  updatePaymentStatus
};