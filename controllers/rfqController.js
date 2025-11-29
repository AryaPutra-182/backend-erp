const { RFQ, RFQItem, Vendor } = require("../models")

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

module.exports = { createRFQ, getNextRFQNumber, getRFQList }
