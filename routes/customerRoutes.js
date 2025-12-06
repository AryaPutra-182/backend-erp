const express = require('express');
const router = express.Router();
const controller = require('../controllers/customerController');
const upload = require('../middleware/upload');

// POST dengan upload file 'imageProfile'
router.post('/', upload.single('imageProfile'), controller.createCustomer);
router.get('/:id', controller.getCustomerDetail);
router.get('/', controller.getAllCustomers);
router.delete('/:id', controller.deleteCustomer);  

module.exports = router;