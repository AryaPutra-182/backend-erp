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
  const last = await ManufacturingOrder.findOne({
    order: [['id', 'DESC']]
  });

  let nextNumber = 1;

  if (last && last.moNumber) {
    const num = last.moNumber.split("/").pop();
    nextNumber = Number(num) + 1;
  }

  return "WH/MO/" + String(nextNumber).padStart(4, "0");
}

// =============== CREATE MO ==================
async function createMO(req, res) {
  const t = await sequelize.transaction();
  try {
    const { productId, quantityToProduce, reference, scheduledDate, endDate } = req.body;

    if (!productId || !quantityToProduce) {
      return res.status(400).json({ message: "productId & quantityToProduce required" });
    }

    const moNumber = await getNextMONumber();

    const mo = await ManufacturingOrder.create(
      {
        moNumber,
        productId,
        quantityToProduce,
        reference,
        scheduledDate,
        endDate,
        status: "Draft",
      },
      { transaction: t }
    );

    const bomItems = await BOM.findAll({ where: { productId } });

    for (const item of bomItems) {
      await ManufacturingOrderMaterial.create(
        {
          manufacturingOrderId: mo.id,
          materialId: item.materialId,
          requiredQty: item.qty * quantityToProduce,
          allocatedQty: 0,
          consumedQty: 0,
          status: "Pending"
        },
        { transaction: t }
      );
    }

    await t.commit();
    // Bungkus dengan data agar frontend aman
    res.status(201).json({ message: "Manufacturing Order Created", data: mo });

  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: err.message });
  }
}

// =============== GET ALL MO ==================
async function getAllMO(req, res) {
  try {
    const data = await ManufacturingOrder.findAll({
      include: [
        { model: Product, as: "product" }, // Pastikan alias 'as' sesuai model index.js
      ],
      order: [['id', 'DESC']]
    })

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// =============== GET MO BY ID ==================
// Ubah ini jadi function biasa, jangan exports.get...
// controllers/manufacturingController.js

async function getManufacturingOrderById(req, res) {
  try {
    const { id } = req.params;

    const mo = await ManufacturingOrder.findByPk(id, {
      include: [
        { 
          model: Product,
          as: 'product',
          attributes: ['id', 'name'] 
        },
        {
          model: ManufacturingOrderMaterial,
          as: 'materials', // <--- WAJIB DITAMBAHKAN (Sesuai models/index.js)
          include: [
            { 
               model: Material,
               as: 'material', // Pastikan di index.js Material juga punya alias ini
               attributes: ['id', 'name', 'cost'] 
            }
          ]
        }
      ]
    });

    if (!mo) {
      return res.status(404).json({ error: "Manufacturing Order not found" });
    }

    // Mapping agar frontend mudah baca (opsional, tapi bagus)
    const data = mo.toJSON();
    // Pindahkan 'materials' ke properti 'items' agar cocok sama frontend logic sebelumnya
    data.items = data.materials; 

    res.json({
      success: true,
      data: data
    });

  } catch (err) {
    console.error("Error Get MO By ID:", err);
    res.status(500).json({ error: err.message });
  }
};


// =============== FUNCTION PLACEHOLDER ==================
async function allocateMaterial(req,res){ res.json({msg:"OK allocate"}) }
async function checkAvailability(req,res){ res.json({msg:"OK availability"}) }
async function startProduction(req,res){ res.json({msg:"OK start"}) }
async function consumeMaterial(req,res){ res.json({msg:"OK consume"}) }
async function completeMO(req,res){ res.json({msg:"OK complete"}) }

// ================= EXPORT YANG BENAR ==================
module.exports = {
  // Mapping Nama Controller -> Nama yang dipanggil Route
  createManufacturingOrder: createMO,      // Route panggil createManufacturingOrder
  getManufacturingOrders: getAllMO,        // Route panggil getManufacturingOrders
  getManufacturingOrderById,               // Route panggil getManufacturingOrderById
  allocateStock: allocateMaterial,         // Route panggil allocateStock
  
  // Fungsi tambahan
  checkAvailability,
  startProduction,
  consumeMaterial,
  completeMO,
};