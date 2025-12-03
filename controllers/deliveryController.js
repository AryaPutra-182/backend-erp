const {
  DeliveryOrder,
  DeliveryItem,
  SalesOrder,
  SalesItem,
  Customer,
  Product,
  sequelize
} = require("../models");


// Create Delivery Order from Sales Order
const createFromSalesOrder = async (req, res) => {
  const { soId } = req.params;

  const t = await sequelize.transaction();

  try {
    const so = await SalesOrder.findByPk(soId, {
      include: [{ model: SalesItem, as: "items", include: [Product] }]
    });

    if (!so) return res.status(404).json({ msg: "Sales order not found" });

    const delivery = await DeliveryOrder.create({
      deliveryNumber: `DO/${Date.now()}`,
      customerId: so.customerId,
      salesOrderId: so.id,
      status: "Pending"
    }, { transaction: t });

    // copy item + harga
   const items = so.items.map(item => ({
  deliveryOrderId: delivery.id,
  productId: item.productId,
  quantityDemand: Number(item.quantity) || 0,
  quantityDone: 0
}));


    await DeliveryItem.bulkCreate(items, { transaction: t });

    await t.commit();
    res.json({ msg: "Delivery Order Created", delivery });

  } catch (err) {
    await t.rollback();
    console.error("❌ Error creating delivery:", err);
    res.status(500).json({ error: err.message });
  }
};



const getAllDeliveryOrders = async (req, res) => {
  try {
    const data = await DeliveryOrder.findAll({
      include: [Customer],
      order: [["createdAt", "DESC"]],
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const getDeliveryOrderById = async (req, res) => {
  try {
   const data = await DeliveryOrder.findByPk(req.params.id, {
  include: [
    Customer,
    {
      model: DeliveryItem,
      as: "items",
      include: [Product]
    }
  ]
});

// Map agar frontend tetap pakai quantity & deliveredQty
data.items = data.items.map(i => ({
  ...i.dataValues,
  quantity: i.quantityDemand,
  deliveredQty: i.quantityDone
}));

res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowed = ["Waiting", "Partial", "Delivered"];
  if (!allowed.includes(status))
    return res.status(400).json({ error: "Invalid status" });

  const doOrder = await DeliveryOrder.findByPk(id);
  if (!doOrder) return res.status(404).json({ error: "Not found" });

  doOrder.status = status;
  await doOrder.save();

  res.json({ msg: "Delivery Status Updated", doOrder });
};

const updateItemQty = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { deliveredQty } = req.body;

    const item = await DeliveryItem.findByPk(itemId);

    if (!item) return res.status(404).json({ error: "Item not found" });

    if (deliveredQty > item.quantityDemand) {
      return res.status(400).json({
        error: "Delivered quantity cannot exceed ordered quantity"
      });
    }

    item.quantityDone = deliveredQty;
    await item.save();

    res.json({ msg: "Item updated", item });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ================= VALIDATE DELIVERY =================
const validateDelivery = async (req, res) => {
  try {
    const delivery = await DeliveryOrder.findByPk(req.params.id, {
      include: [{ model: DeliveryItem, as: "items" }]
    });

    if (!delivery) return res.status(404).json({ error: "Delivery not found" });

    const notFullyDelivered = delivery.items.some(
      item => item.quantityDone < item.quantityDemand
    );

    if (notFullyDelivered) {
      delivery.status = "Partial";
    } else {
      delivery.status = "Delivered";
    }

    await delivery.save();

    res.json({ msg: "Delivery validated", status: delivery.status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


module.exports = {
  createFromSalesOrder,
  getAllDeliveryOrders,
  getDeliveryOrderById,
  updateStatus,
  updateItemQty,
  validateDelivery,
};
