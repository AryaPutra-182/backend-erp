const {
  ManufacturingOrder,
  ManufacturingOrderMaterial,
  Product,
  Material,
  BOM,
  sequelize
} = require("../models");


// ----------------------------------------------------------
// CREATE MANUFACTURING ORDER
// ----------------------------------------------------------
exports.createMO = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { productId, quantityToProduce } = req.body;

    if (!productId || !quantityToProduce) {
      return res.status(400).json({ message: "productId & quantityToProduce wajib diisi" });
    }

    // Buat MO
    const mo = await ManufacturingOrder.create(
      {
        moNumber: `MO-${Date.now()}`,
        productId,
        quantityToProduce,
        status: "Draft"
      },
      { transaction: t }
    );

    // Copy BOM ke ManufacturingOrderMaterial
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
};


// ----------------------------------------------------------
// CHECK MATERIAL AVAILABILITY
// ----------------------------------------------------------
exports.checkAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    const materials = await ManufacturingOrderMaterial.findAll({
      where: { manufacturingOrderId: id },
      include: [{ model: Material }]
    });

    if (!materials.length) {
      return res.status(404).json({ message: "MO atau material tidak ditemukan" });
    }

    const result = materials.map((m) => ({
      material: m.Material.name,
      required: m.requiredQty,
      stock: m.Material.stock,
      status: m.Material.stock >= m.requiredQty ? "READY" : "NOT ENOUGH"
    }));

    res.json({ manufacturingOrderId: id, materials: result });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ----------------------------------------------------------
// ALLOCATE MATERIAL (RESERVE STOCK)
// ----------------------------------------------------------
exports.allocateMaterial = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;

    const items = await ManufacturingOrderMaterial.findAll({
      where: { manufacturingOrderId: id },
      include: [{ model: Material }]
    });

    if (!items.length) return res.status(404).json({ message: "MO tidak ditemukan" });

    for (const item of items) {
      if (item.Material.stock < item.requiredQty) {
        throw new Error(`Material tidak cukup: ${item.Material.name}`);
      }

      // Kurangi stock actual
      await Material.update(
        { stock: item.Material.stock - item.requiredQty },
        { where: { id: item.materialId }, transaction: t }
      );

      // Update allocated qty
      item.allocatedQty = item.requiredQty;
      item.status = "Allocated";
      await item.save({ transaction: t });
    }

    await ManufacturingOrder.update(
      { status: "In Progress" },
      { where: { id }, transaction: t }
    );

    await t.commit();

    res.json({ message: "Material allocated successfully" });

  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: err.message });
  }
};


// ----------------------------------------------------------
// START PRODUCTION
// ----------------------------------------------------------
exports.startProduction = async (req, res) => {
  try {
    const { id } = req.params;

    await ManufacturingOrder.update(
      { status: "In Progress", actualStart: new Date() },
      { where: { id } }
    );

    res.json({ message: "Production Started" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ----------------------------------------------------------
// CONSUME MATERIAL (REAL USAGE)
// ----------------------------------------------------------
exports.consumeMaterial = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;

    const materials = await ManufacturingOrderMaterial.findAll({
      where: { manufacturingOrderId: id }
    });

    for (const item of materials) {
      item.consumedQty = item.requiredQty; // dapat kamu ubah jadi dynamic input
      item.status = "Completed";
      await item.save({ transaction: t });
    }

    await t.commit();
    res.json({ message: "Material consumption recorded" });

  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: err.message });
  }
};


// ----------------------------------------------------------
// COMPLETE MANUFACTURING ORDER
// ----------------------------------------------------------
exports.completeMO = async (req, res) => {
  try {
    const { id } = req.params;

    await ManufacturingOrder.update(
      { status: "Done", actualFinish: new Date() },
      { where: { id } }
    );

    res.json({ message: "Manufacturing Order Completed" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
