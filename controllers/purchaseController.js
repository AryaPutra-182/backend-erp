const { RFQ, RFQItem, Material, Vendor, sequelize } = require("../models");

// 1. BUAT PURCHASE ORDER (PO)
exports.createPurchaseOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { vendorId, items, expectedDate } = req.body;

    // Generate PO Number (PO/2023/001)
    const timestamp = Date.now().toString().slice(-4);
    const poNumber = `PO/${new Date().getFullYear()}/${timestamp}`;

    const po = await RFQ.create({
      rfqNumber: poNumber, // Kita pakai tabel RFQ saja biar hemat
      vendorId,
      expectedArrival: expectedDate,
      status: "Purchase Order" // Status langsung PO
    }, { transaction: t });

    for (const item of items) {
      await RFQItem.create({
        rfqId: po.id,
        materialId: item.materialId, // Pastikan model RFQItem punya materialId (bukan productId)
        qty: item.qty,
        price: item.price,
        total: item.qty * item.price
      }, { transaction: t });
    }

    await t.commit();
    res.status(201).json({ success: true, data: po });

  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: err.message });
  }
};

// 2. RECEIVE PRODUCTS (INI YANG NAMBAH STOK)
exports.receiveProducts = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;

    const po = await RFQ.findByPk(id, {
      include: [{ model: RFQItem }]
    });

    if (!po) return res.status(404).json({ error: "PO Not Found" });
    if (po.status === "Done") return res.status(400).json({ error: "Already Received" });

    // === LOGIC SUNTIK STOK ===
    for (const item of po.RFQItems) {
      // Cari Material terkait
      const material = await Material.findByPk(item.materialId);
      
      if (material) {
        // Update Stok: Stok Lama + Qty Beli
        // Asumsi nama kolom stok di Material adalah 'quantity' atau 'weight'
        const newStock = Number(material.quantity || 0) + Number(item.qty);
        
        await material.update({ quantity: newStock }, { transaction: t });
        
        // Update harga beli terakhir (biar HPP update)
        await material.update({ cost: item.price }, { transaction: t });
      }
    }

    // Ubah status PO jadi Done
    await po.update({ status: "Done" }, { transaction: t });

    await t.commit();
    res.json({ success: true, message: "Products Received & Stock Updated!" });

  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: err.message });
  }
};

// 3. GET LIST
exports.getAllPO = async (req, res) => {
  try {
    const data = await RFQ.findAll({ 
        include: [
            { model: Vendor },   // Supaya nama vendor muncul
            { model: RFQItem }   // <--- WAJIB: Supaya item & harga muncul untuk dihitung
        ],
        order: [['createdAt', 'DESC']]
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getPurchaseOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const po = await RFQ.findByPk(id, {
      include: [
        { model: Vendor }, // Data Vendor
        
        // --- TAMBAHKAN INI (WAJIB) ---
        { 
            model: RFQItem, 
            include: [ // Biar nama material muncul
                { model: Material, as: 'material', attributes: ['name', 'internalReference'] } 
            ] 
        } 
      ]
    });

    if (!po) return res.status(404).json({ error: "PO Not Found" });
    res.json(po);

  } catch (err) {
    console.error("ERROR DETAIL PO:", err); 
    res.status(500).json({ error: err.message });
  }
};