const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate, requireRole('admin'));

router.get('/dashboard', adminController.getDashboard);
router.post('/users', adminController.createUserValidation, adminController.createUser);
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.post('/stores', adminController.createStore);
router.get('/stores', adminController.getStores);

module.exports = router;
