const router = require("express").Router();
const c = require("../controllers/positionController");

router.get("/", c.getAll);
router.post("/", c.create);
router.delete('/:id', c.delete);

module.exports = router;
