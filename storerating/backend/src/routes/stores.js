const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const ownerController = require('../controllers/ownerController');
const { authenticate, requireRole } = require('../middleware/auth');

// Normal user routes
router.get('/', authenticate, requireRole('user', 'admin'), storeController.getStores);
router.post('/rate', authenticate, requireRole('user'), storeController.submitRating);

// Store owner routes
router.get('/owner/dashboard', authenticate, requireRole('store_owner'), ownerController.getMyStoreDashboard);

module.exports = router;
