const { ManufacturingOrderMaterial, Product, Material } = require("../models");

// =========================================================
// 1. CREATE BOM / RECIPE
// =========================================================
const createBOM = async (req, res) => {
  try {
    const { productId, quantity, reference, components } = req.body;

    // 1. Validasi Input Dasar
    if (!productId || !quantity) {
      return res.status(400).json({ message: "productId & quantity wajib diisi" });
    }

    if (!Array.isArray(components) || components.length === 0) {
      return res.status(400).json({ message: "components (bahan baku) tidak boleh kosong" });
    }

    // 2. Generate Reference Otomatis (Jika user tidak isi)
    let finalReference = reference;
    if (!finalReference) {
       const timestamp = Date.now().toString().slice(-6); 
       finalReference = `BOM-${timestamp}`;
    }

    // 3. Simpan Komponen ke Database
    const results = [];

    // ❌ DULU EROR DISINI: const baseId = Date.now(); (HAPUS INI)

    for (const c of components) {
      const entry = await ManufacturingOrderMaterial.create({
        // ❌ JANGAN ISI 'id' MANUAL (Biarkan Database Auto Increment)
        // id: baseId + i, <--- INI PENYEBAB ERROR 500

        productId: Number(productId),
        reference: finalReference,
        manufacturingOrderId: null, 
        materialId: Number(c.materialId),
        requiredQty: Number(c.qty),
        status: 'Template' 
      });
      results.push(entry);
    }

    res.status(201).json({
      ok: true,
      message: "Manufacturing BOM created successfully",
      reference: finalReference,
      items: results
    });

  } catch (error) {
    console.error("❌ ERROR CREATE BOM:", error);
    res.status(500).json({ 
        ok: false, 
        message: "Gagal membuat BOM. Cek server log.", 
        error: error.message 
    });
  }
};

// =========================================================
// 2. GET ALL BOMs
// =========================================================
const getAllBOM = async (req, res) => {
  try {
    const data = await ManufacturingOrderMaterial.findAll({
      attributes: ["reference", "productId"],
      include: [
        { model: Product, as: "product", attributes: ["id", "name"] }
      ],
      group: ["reference", "productId", "product.id", "product.name"]
    });

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: "Server error" });
  }
};

// =========================================================
// 3. GET BOM BY REFERENCE
// =========================================================
const getBOMByReference = async (req, res) => {
  try {
    const { ref } = req.params;

    const data = await ManufacturingOrderMaterial.findAll({
      where: { reference: ref },
      include: [
        { model: Product, as: "product", attributes: ["id", "name"] },
        { 
            model: Material, 
            as: "material", 
            // ❌ DULU ERROR DISINI: attributes: ["id", "name", "cost", "price"]
            // ✅ PERBAIKAN: Hapus 'price' karena kolom tidak ada di DB
            attributes: ["id", "name", "cost"] 
        } 
      ],
      order: [["id", "ASC"]]
    });

    if (!data || data.length === 0) {
        return res.status(404).json({ message: "BOM Not Found" });
    }

    res.json(data);

  } catch (error) {
    console.error("Error Get BOM:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// =========================================================
// EXPORT MODULE
// =========================================================
module.exports = {
    createBOM,          
    getAllBOM,          
    getBOMByReference,  
    
    // Alias untuk kompatibilitas
    createManufacturingOrder: createBOM,
    getAllManufacturingOrders: getAllBOM,
    getManufacturingOrderByReference: getBOMByReference
};