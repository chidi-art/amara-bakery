const express = require('express');
const auth = require('../middleware/auth.middleware');
const admin = require('../middleware/admin.middleware');
const asyncHandler = require('../utils/asyncHandler');
const controller = require('../controllers/order.controller');
const router = express.Router();

router.post('/guest', asyncHandler(controller.createGuest));
router.use(auth);
router.post('/', asyncHandler(controller.create));
router.get('/', asyncHandler(controller.getOrders));
router.get('/all', admin, asyncHandler(controller.getAllOrders));
router.put('/:id/status', admin, asyncHandler(controller.updateStatus));
router.get('/:id', asyncHandler(controller.getOrderById));
module.exports = router;