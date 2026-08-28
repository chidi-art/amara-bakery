const express = require('express');
const auth = require('../middleware/auth.middleware');
const admin = require('../middleware/admin.middleware');
const controller = require('../controllers/user.controller');
const router = express.Router();

router.get('/me', auth, controller.getProfile);
router.put('/me', auth, controller.updateProfile);
router.delete('/me', auth, controller.deleteAccount);
router.get('/', auth, admin, controller.getUsers);
router.get('/:id', auth, admin, controller.getUserById);

module.exports = router;