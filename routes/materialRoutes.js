const express = require('express');
const router = express.Router();
const controller = require('../controllers/materialController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  }
});

const upload = multer({ storage });

router.post('/', upload.single('image'), controller.createMaterial);
router.get('/', controller.getMaterials);
router.get('/:id', controller.getMaterialById);
router.put('/:id', upload.single('image'), controller.updateMaterial);
router.delete('/:id', controller.deleteMaterial);

module.exports = router;
