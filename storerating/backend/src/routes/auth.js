const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/register', authController.registerValidation, authController.register);
router.post('/login', authController.login);
router.put('/password', authenticate, authController.updatePasswordValidation, authController.updatePassword);

module.exports = router;
