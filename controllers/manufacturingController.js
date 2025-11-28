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
    res.status(201).json({ message: "Manufacturing Order Created", data: mo });

  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: err.message });
  }
}
async function getAllMO(req, res) {
  try {
const data = await ManufacturingOrder.findAll({
  include: [
    { model: Product, as: "product" },
  ],
  order: [['id', 'DESC']]
})


    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


// =============== FUNCTION MINIMAL SUPAYA TIDAK ERROR ==================

async function allocateMaterial(req,res){ res.json({msg:"OK allocate"}) }
async function checkAvailability(req,res){ res.json({msg:"OK availability"}) }
async function startProduction(req,res){ res.json({msg:"OK start"}) }
async function consumeMaterial(req,res){ res.json({msg:"OK consume"}) }
async function completeMO(req,res){ res.json({msg:"OK complete"}) }

// ================= EXPORT YANG BENAR ==================
module.exports = {
  getNextMONumber,
  createMO,
  checkAvailability,
  allocateMaterial,
  startProduction,
  consumeMaterial,
  completeMO,
  getAllMO
};
