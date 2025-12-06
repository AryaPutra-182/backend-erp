const express = require('express');
const router = express.Router();
const controller = require('../controllers/vendorController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage });

router.post('/', upload.single('image'), controller.createVendor);
router.get('/', controller.getAllVendors);
router.delete('/:id', controller.deleteVendor);

module.exports = router;
