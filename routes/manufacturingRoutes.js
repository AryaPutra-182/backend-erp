const express = require('express');
const router = express.Router();
const controller = require('../controllers/manufacturingController');

router.post('/', controller.createMO);
router.get('/:id/check', controller.checkAvailability);

module.exports = router;