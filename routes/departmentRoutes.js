const router = require("express").Router();
const c = require("../controllers/departmentController");

router.get("/", c.getAll);
router.post("/", c.create);

module.exports = router;
