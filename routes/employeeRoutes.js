const express = require("express");
const router = express.Router();
const controller = require("../controllers/employeeController");
const multer = require("multer");
const path = require("path");

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `employee_${Date.now()}${ext}`);
  }
});

const upload = multer({ storage });


// Routes
router.get("/", controller.getAll);
router.get('/:id', controller.getById); // Route Detail
router.delete('/:id', controller.delete);

// POST must use multer to receive image
router.post("/", upload.single("photo"), controller.create);

module.exports = router;
