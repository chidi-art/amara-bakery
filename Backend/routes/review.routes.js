const express = require('express');
const auth = require('../middleware/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');
const controller = require('../controllers/review.controller');
const router = express.Router();

router.get('/products/:productId/reviews', asyncHandler(controller.list));
router.post('/products/:productId/reviews', auth, asyncHandler(controller.create));
router.put('/reviews/:id', auth, asyncHandler(controller.update));
router.delete('/reviews/:id', auth, asyncHandler(controller.remove));
module.exports = router;