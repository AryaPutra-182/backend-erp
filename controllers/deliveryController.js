const {
  DeliveryOrder,
  DeliveryItem,
  SalesOrder,
  SalesItem,
  Customer,
  Product,
  sequelize
} = require("../models");

// 1. Create Delivery Order from Sales Order
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

// 2. Get All DO
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

// 3. Get Detail DO (PERBAIKAN ERROR DI SINI)
const getDeliveryOrderById = async (req, res) => {
  try {
    const data = await DeliveryOrder.findByPk(req.params.id, {
      include: [
        Customer,
        // FIX: Hapus 'deliveryAddress' dari attributes SalesOrder karena kolom itu tidak ada di tabel SalesOrders
        { 
          model: SalesOrder, 
          as: 'salesOrder', 
          attributes: ['soNumber'] // Cukup ambil soNumber saja
        },
        {
          model: DeliveryItem,
          as: "items",
          include: [Product]
        }
      ]
    });

    if (!data) return res.status(404).json({ error: "Not Found" });

    // Convert to JSON & Map fields for frontend compatibility
    const result = data.toJSON();
    
    // Jika butuh deliveryAddress, biasanya diambil dari DeliveryOrder itu sendiri (result.deliveryAddress)
    // atau dari Customer (result.Customer.companyAddress).

    result.items = result.items.map(i => ({
      ...i,
      quantity: i.quantityDemand,
      deliveredQty: i.quantityDone
    }));

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// 4. Update Status Manual
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

// 5. Update Item Quantity (Input Manual Delivered Qty)
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


// ============================================================
// 6. VALIDATE DELIVERY (POTONG STOK & UPDATE STATUS)
// ============================================================
const validateDelivery = async (req, res) => {
  const t = await sequelize.transaction(); // Mulai Transaksi Database
  try {
    const delivery = await DeliveryOrder.findByPk(req.params.id, {
      include: [{ model: DeliveryItem, as: "items" }],
      transaction: t
    });

    if (!delivery) throw new Error("Delivery not found");
    if (delivery.status === "Delivered") throw new Error("Delivery ini sudah diproses sebelumnya.");

    // A. Loop setiap item untuk potong stok
    for (const item of delivery.items) {
      const product = await Product.findByPk(item.productId, { transaction: t });
      
      if (!product) throw new Error(`Produk ID ${item.productId} tidak ditemukan.`);

      // Prioritas: quantityDone (yang diinput user). Jika 0, anggap kirim semua (quantityDemand)
      const qtyToDeduct = item.quantityDone > 0 ? item.quantityDone : item.quantityDemand;

      // Cek Stok Gudang
      const currentStock = Number(product.quantity || 0); 

      if (currentStock < qtyToDeduct) {
         throw new Error(`Stok "${product.name}" tidak cukup! Sisa: ${currentStock}, Mau kirim: ${qtyToDeduct}`);
      }

      // Eksekusi Potong Stok
      await product.update({ 
        quantity: currentStock - qtyToDeduct 
      }, { transaction: t });

      // Update item agar quantityDone terisi penuh jika user tidak input manual
      if (item.quantityDone === 0) {
         await item.update({ quantityDone: qtyToDeduct }, { transaction: t });
      }
    }

    // B. Tentukan Status Akhir
    // Cek apakah ada item yang dikirim parsial
    const isPartial = delivery.items.some(i => i.quantityDone < i.quantityDemand);
    
    delivery.status = isPartial ? "Partial" : "Delivered";
    await delivery.save({ transaction: t });

    await t.commit(); // Simpan Perubahan Permanen
    res.json({ msg: "Delivery Validated & Inventory Updated", status: delivery.status });

  } catch (err) {
    await t.rollback(); // Batalkan semua jika ada error
    console.error("❌ VALIDATE ERROR:", err);
    res.status(400).json({ error: err.message });
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