const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const auth = require('../middleware/auth.middleware');
const admin = require('../middleware/admin.middleware');
const controller = require('../controllers/product.controller');
const router = express.Router();

router.get('/', asyncHandler(controller.getProducts));
router.get('/:id', asyncHandler(controller.getProductById));
router.post('/', auth, admin, asyncHandler(controller.createProduct));
router.put('/:id', auth, admin, asyncHandler(controller.updateProduct));
router.delete('/:id', auth, admin, asyncHandler(controller.deleteProduct));
module.exports = router;