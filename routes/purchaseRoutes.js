const express = require("express")
const router = express.Router()

const { createRFQ, getNextRFQNumber, getRFQList} = require("../controllers/rfqController")


router.post("/create-rfq", createRFQ)
router.get("/next-rfq-number", async (req, res) => {
  try {
    const num = await getNextRFQNumber()
    return res.json({ success: true, number: num })
  } catch(e) {
    return res.status(500).json({ error: e.message })
  }
})
router.get("/rfq-list", async (req, res) => {
  try {
    const list = await getRFQList()
    return res.json(list)
  } catch(e) {
    return res.status(500).json({ error: e.message })
  }
})




module.exports = router
