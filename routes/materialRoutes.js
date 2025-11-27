const express = require('express');
const router = express.Router();
const controller = require('../controllers/materialController');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('image'), controller.createMaterial);
router.get('/', controller.getMaterials);
router.get('/:id', controller.getMaterialById);
router.put('/:id', upload.single('image'), controller.updateMaterial);
router.delete('/:id', controller.deleteMaterial);

module.exports = router;
