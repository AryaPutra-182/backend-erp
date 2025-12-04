const { RFQ, RFQItem, Vendor, Product } = require("../models")

const sequelize = require("../config/database")

async function getNextRFQNumber() {
  const last = await RFQ.findOne({
    order: [['id', 'DESC']],
    raw: true
  })

  let next = 1

  if (last && last.rfqNumber) {
    next = Number(last.rfqNumber.replace("P", "")) + 1
  }

  return "P" + String(next).padStart(5, "0")
}

async function createRFQ(req, res) {
  const t = await sequelize.transaction()

  try {
    const {
      vendorId,
      orderDeadline,
      vendorReference,
      expectedArrival,
      components
    } = req.body

    const rfqNumber = await getNextRFQNumber()

    const rfq = await RFQ.create({
      rfqNumber,
      vendorId,
      orderDeadline,
      vendorReference,
      expectedArrival,
      status: "Draft"
    }, { transaction: t })

    for (const c of components) {
      await RFQItem.create({
        rfqId: rfq.id,
        productId: c.productId,
        qty: c.qty,
        price: c.price,
        amount: c.amount
      }, { transaction: t })
    }

    await t.commit()

    return res.json({
      success: true,
      data: {
        id: rfq.id,
        rfqNumber
      }
    })

  } catch (err) {
    await t.rollback()
    return res.status(500).json({ error: err.message })
  }
}

async function getRFQList() {
  const list = await RFQ.findAll({
    include: [
      {
        model: Vendor,
        attributes: ["vendorName"]
      },
      {
        model: RFQItem,
        attributes: []
      }
    ],
    attributes: [
      "id",
      "rfqNumber",
      "status",
      [sequelize.fn("SUM", sequelize.col("RFQItems.amount")), "total"]
    ],
    group: ["RFQ.id"]
  })

  return list.map(r => ({
    id: r.id,
    rfqNumber: r.rfqNumber,
    vendorName: r.Vendor.vendorName,
    status: r.status,
    total: r.get("total")
  }))
}
// ==========================================
// GET RFQ DETAIL BY ID (Safe Mode)
// ==========================================
// ==========================================
// GET RFQ DETAIL BY ID (Final Fix)
// ==========================================
// ==========================================
// GET RFQ DETAIL BY ID (Versi Mapping Paksa)
// ==========================================
// ==========================================
// GET RFQ DETAIL BY ID (Disesuaikan dengan CreateRFQ)
// ==========================================
// ==========================================
// GET RFQ DETAIL BY ID (Versi Super Teliti)
// ==========================================
async function getRFQById(req, res) {
  try {
    const { id } = req.params;
    
    const rfq = await RFQ.findByPk(id, {
      include: [
        { model: Vendor },
        { 
          model: RFQItem, 
          // Hapus alias agar default.
          // Note: Jika di models/index.js ada alias 'as: items', 
          // maka di sini harusnya pakai { model: RFQItem, as: 'items' }
          // Tapi kita coba default dulu untuk debugging.
          include: [{ model: Product }] 
        }
      ]
    });

    if (!rfq) return res.status(404).json({ error: "RFQ Not Found" });

    const data = rfq.toJSON();

    // 1. Deteksi Array Item (Bisa 'items' atau 'RFQItems')
    const rawItems = data.items || data.RFQItems || [];

    // 2. Mapping Super Teliti
    data.items = rawItems.map(item => {
      
      // Cek SEMUA kemungkinan nama kolom untuk Quantity
      const finalQty = Number(
        item.qty ?? 
        item.quantity ?? 
        item.Quantity ?? 
        0
      );

      // Cek SEMUA kemungkinan nama kolom untuk Harga
      const finalPrice = Number(
        item.price ?? 
        item.unitPrice ?? 
        item.Price ?? 
        0
      );

      // Cek Total per baris
      let finalTotal = Number(
        item.amount ?? 
        item.totalPrice ?? 
        item.total ?? 
        0
      );

      // Jika total masih 0, hitung manual sendiri
      if (finalTotal === 0) {
        finalTotal = finalQty * finalPrice;
      }

      return {
        id: item.id,
        quantity: finalQty,    // Frontend minta ini
        unitPrice: finalPrice, // Frontend minta ini
        totalPrice: finalTotal, // Frontend minta ini
        
        Product: item.Product || item.product || { 
            name: "Produk Hilang", 
            internalReference: "-" 
        }
      };
    });

    // 3. Hitung Ulang Grand Total dari Item yang sudah bersih
    // (Abaikan total dari header RFQ karena sering null)
    const grandTotal = data.items.reduce((sum, x) => sum + x.totalPrice, 0);
    data.total = grandTotal;

    // Bersihkan field duplikat
    delete data.RFQItems;

    // LOG DEBUGGING (Cek terminal backend setelah refresh)
    console.log(`[DEBUG RFQ #${id}]`);
    console.log(`- Item 1 Raw:`, rawItems[0]); // Lihat data mentah dari DB
    console.log(`- Item 1 Fix: Qty=${data.items[0]?.quantity}, Price=${data.items[0]?.unitPrice}`);
    console.log(`- Grand Total: ${data.total}`);

    res.json(data);

  } catch (err) {
    console.error("❌ Error Get Detail:", err);
    res.status(500).json({ error: err.message });
  }
}
module.exports = { createRFQ, getNextRFQNumber, getRFQList, getRFQById }
