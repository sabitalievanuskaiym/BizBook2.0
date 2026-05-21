const express = require('express');
const { getAnalyticsData, getTenantInfo } = require('../controllers/adminController');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const tenantMiddleware = require('../middleware/tenantMiddleware');

const router = express.Router();

router.get('/tenant', tenantMiddleware, getTenantInfo);

router.use(tenantMiddleware);
router.use(authMiddleware);
router.use(requireRole('admin'));

router.get('/analytics', getAnalyticsData);

module.exports = router;
