const express = require('express');
const router = express.Router();
const controller = require('../controllers/productController');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('image'), controller.createProduct);

module.exports = router;
