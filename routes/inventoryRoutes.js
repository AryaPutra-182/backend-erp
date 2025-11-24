const express = require('express');
const router = express.Router();
const controller = require('../controllers/inventoryController');
const upload = require('../middleware/upload');

router.post('/products', upload.single('image'), controller.createProduct);
router.get('/products', controller.getAllProducts);

router.post('/materials', controller.createMaterial);
router.get('/materials', controller.getAllMaterials);

module.exports = router;