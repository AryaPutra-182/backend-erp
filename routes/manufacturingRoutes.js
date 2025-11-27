const router = require("express").Router();
const controller = require("../controllers/manufacturingController");

router.post("/", controller.createMO);
router.get("/:id/check", controller.checkAvailability);
router.post("/:id/allocate", controller.allocateMaterial);
router.post("/:id/start", controller.startProduction);
router.post("/:id/consume", controller.consumeMaterial);
router.post("/:id/complete", controller.completeMO);

module.exports = router;
