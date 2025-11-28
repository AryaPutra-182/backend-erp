const { ManufacturingOrderMaterial, Product, Material } = require("../models");

exports.createManufacturingOrder = async (req, res) => {
  try {
    const { productId, quantity, reference, components } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ message: "productId & quantity wajib" });
    }

    if (!Array.isArray(components) || components.length === 0) {
      return res.status(400).json({ message: "components tidak boleh kosong" });
    }

    const last = await ManufacturingOrderMaterial.findOne({
      order: [["createdAt", "DESC"]],
    });

    let nextId = "MO-001";
    if (last && last.id) {
      const num = parseInt(last.id.replace("MO-", ""));
      const nextNum = num + 1;
      nextId = `MO-${nextNum.toString().padStart(3, "0")}`;
    }

    let finalReference = reference;
    if (!finalReference) {
      finalReference = nextId;
    }

    const results = [];

    for (const c of components) {
      const entry = await ManufacturingOrderMaterial.create({
        id: nextId,
        productId,
        reference: finalReference,
        manufacturingOrderId: nextId,
        materialId: c.materialId,
        requiredQty: Number(c.qty)
      });
      results.push(entry);
    }

    res.status(201).json({
      ok: true,
      message: "Manufacturing BOM created",
      reference: finalReference,
      id: nextId,
      items: results
    });

  } catch (error) {
    console.error("ERROR CREATE MFG ORDER:", error);
    res.status(500).json({ ok: false, message: "Server error" });
  }
};



exports.getAllManufacturingOrders = async (req, res) => {
  try {
const data = await ManufacturingOrderMaterial.findAll({
  attributes: ["id","reference","productId"],
  include: [
    { model: Product, as: "product", attributes: ["id","name"] }
  ],
  group: ["reference","id","productId","product.id","product.name"]
});


    res.json(data);
  } catch (error) {
    res.status(500).json({ ok:false, message: "Server error" });
  }
};



exports.getManufacturingOrderByReference = async (req, res) => {
  try {
    const { ref } = req.params;

    const data = await ManufacturingOrderMaterial.findAll({
      where: { reference: ref },
      include: [
        { model: Product, as: "product", attributes: ["id","name"] },
        { model: Material, as: "material", attributes: ["id","name"] }
      ],
      order: [["uid", "ASC"]]
    });

    res.json(data);

  } catch(error){
    console.error(error);
    res.status(500).json({ message:"Server error" });
  }
}
