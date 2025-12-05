const { 
  ManufacturingOrder,
  ManufacturingOrderMaterial,
  Product,
  Material,
  BOM,
  sequelize
} = require("../models");

// =============== AUTO GENERATE NUMBER ==================
async function getNextMONumber() {
  const last = await ManufacturingOrder.findOne({ order: [['id', 'DESC']] });
  let nextNumber = 1;
  if (last && last.moNumber) {
    const num = last.moNumber.split("/").pop();
    nextNumber = Number(num) + 1;
  }
  return "WH/MO/" + String(nextNumber).padStart(4, "0");
}

// =============== 1. CREATE MO (PERBAIKAN UTAMA) ==================
// controllers/manufacturingController.js

async function createMO(req, res) {
  const t = await sequelize.transaction();
  try {
    // 1. Ambil data
    const { productId, quantityToProduce, reference, scheduledDate, endDate, components } = req.body;

    if (!productId || !quantityToProduce) {
      return res.status(400).json({ message: "productId & quantityToProduce required" });
    }

    const moNumber = await getNextMONumber();

    // 2. Buat Header MO
    const mo = await ManufacturingOrder.create(
      {
        moNumber,
        productId: Number(productId),
        quantityToProduce: Number(quantityToProduce),
        reference,
        scheduledDate,
        endDate,
        status: "Draft",
      },
      { transaction: t }
    );

    // 3. Logic Items (Manual / BOM)
    let itemsToSave = [];

    if (components && components.length > 0) {
        // Manual Input
        itemsToSave = components.map(c => ({
            materialId: c.materialId,
            qty: Number(c.qty)
        }));
    } else {
        // Auto from BOM
        const bomItems = await BOM.findAll({ where: { productId } });
        itemsToSave = bomItems.map(b => ({
            materialId: b.materialId,
            qty: b.qty * Number(quantityToProduce)
        }));
    }

    if (itemsToSave.length === 0) {
        throw new Error("Gagal: Tidak ada komponen material yang terdeteksi.");
    }

    // 4. Simpan Items (PERBAIKAN DI SINI)
    for (const item of itemsToSave) {
      await ManufacturingOrderMaterial.create(
        {
          manufacturingOrderId: mo.id,
          
          // === FIX: TAMBAHKAN BARIS INI ===
          productId: Number(productId), // <--- WAJIB DIISI AGAR TIDAK ERROR notNull
          
          materialId: item.materialId,
          requiredQty: item.qty,
          allocatedQty: 0,
          consumedQty: 0,
          status: "Pending"
        },
        { transaction: t }
      );
    }

    await t.commit();
    res.status(201).json({ message: "Manufacturing Order Created", data: mo });

  } catch (err) {
    await t.rollback();
    console.error("❌ CREATE MO ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}

// =============== 2. ALLOCATE STOCK / PRODUCE (PERBAIKAN ALIAS) ==================
async function updateMaterialStock(moId, transaction) {
    // Gunakan alias 'materials' sesuai models/index.js
    const mo = await ManufacturingOrder.findByPk(moId, {
        include: [{ model: ManufacturingOrderMaterial, as: 'materials' }], 
        transaction 
    });

    if (!mo) throw new Error("MO tidak ditemukan.");
    if (mo.status === "Done") throw new Error("Order sudah selesai.");

    // FIX: Baca dari 'materials', bukan 'ManufacturingOrderMaterials'
    const items = mo.materials; 
    
    if (!items || items.length === 0) {
        throw new Error("Data Corrupt: MO ini tidak memiliki daftar material di database. Silakan buat MO baru.");
    }
    
    // A. Kurangi Stok Material (Raw)
    for (const item of items) {
        const material = await Material.findByPk(item.materialId, { transaction });
        const requiredQty = Number(item.requiredQty);

        if (material) {
            if (material.weight < requiredQty) {
                 throw new Error(`Stok ${material.name} kurang. Butuh: ${requiredQty}, Ada: ${material.weight}`);
            }
            const newWeight = material.weight - requiredQty;
            await material.update({ weight: newWeight }, { transaction }); // Update weight
            await item.update({ allocatedQty: requiredQty, status: "Allocated" }, { transaction });
        }
    }

    // B. Tambah Stok Produk Jadi (Finished)
    const product = await Product.findByPk(mo.productId, { transaction });
    if (!product) throw new Error("Produk tidak ditemukan.");

    // Gunakan kolom 'quantity' sesuai model Product.js
    const newProductQty = (product.quantity || 0) + Number(mo.quantityToProduce);
    await product.update({ quantity: newProductQty }, { transaction }); 
    
    // C. Update Status
    await mo.update({ status: "Done" }, { transaction });
    
    return mo;
}

// Fungsi Wrapper untuk Route
async function allocateStock(req, res) {
    const t = await sequelize.transaction();
    try {
        const updatedMo = await updateMaterialStock(req.params.id, t);
        await t.commit();
        res.json({ success: true, data: updatedMo });
    } catch (err) {
        await t.rollback();
        res.status(400).json({ error: err.message }); 
    }
}

// =============== 3. GET MO BY ID (PERBAIKAN QUANTITY) ==================
async function getManufacturingOrderById(req, res) {
  try {
    const moId = Number(req.params.id); 
    if (isNaN(moId) || moId === 0) return res.status(400).json({ error: "Invalid ID" });

    const mo = await ManufacturingOrder.findByPk(moId, { 
      include: [
        { 
          model: Product, as: 'product',
          attributes: ['id', 'name', 'quantity'] // Pakai 'quantity'
        },
        {
          model: ManufacturingOrderMaterial, as: 'materials',
          include: [{ model: Material, as: 'material', attributes: ['id', 'name', 'cost', 'weight'] }]
        }
      ]
    });

    if (!mo) return res.status(404).json({ error: "Not found" });

    const data = mo.toJSON();
    data.items = data.materials; // Mapping untuk frontend

    res.json({ success: true, data: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =============== 4. GET ALL MO ==================
async function getAllMO(req, res) {
  try {
    const data = await ManufacturingOrder.findAll({
      include: [{ model: Product, as: "product" }],
      order: [['id', 'DESC']]
    })
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// =============== EXPORTS ==================
module.exports = {
  createManufacturingOrder: createMO, 
  getManufacturingOrders: getAllMO,
  getManufacturingOrderById,
  allocateStock, 
  // Placeholder functions...
  checkAvailability: (req,res)=>res.json({}),
  startProduction: (req,res)=>res.json({}),
  consumeMaterial: (req,res)=>res.json({}),
  completeMO: (req,res)=>res.json({})
};