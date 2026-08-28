const express = require('express');
const auth = require('../middleware/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');
const controller = require('../controllers/payment.controller');
const router = express.Router();

router.post('/webhook', asyncHandler(controller.webhook));
router.use(auth);
router.post('/initialize', asyncHandler(controller.initialize));
router.get('/verify/:reference', asyncHandler(controller.verify));
module.exports = router;