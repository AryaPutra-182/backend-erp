const express = require('express');
const router = express.Router();
const controller = require('../controllers/inventoryController'); // Pastikan nama file controller benar
const upload = require('../middleware/upload'); // Pastikan middleware multer benar

// Route Product
router.post('/products', upload.single('image'), controller.createProduct);
router.get('/products', controller.getAllProducts);

// Route Material
router.post('/materials', controller.createMaterial); // Material biasanya tidak pakai gambar, jadi tidak butuh upload.single
router.get('/materials', controller.getAllMaterials);
router.delete ('/products/:id', controller.deleteProduct);
router.put('/products/:id', upload.single('image'), controller.updateProduct);
router.get('/products/:id', controller.getProductById);



module.exports = router;