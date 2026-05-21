const express = require('express');
const { getAppointmentsForMaster } = require('../controllers/staffController');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const tenantMiddleware = require('../middleware/tenantMiddleware');

const router = express.Router();

router.use(tenantMiddleware);
router.use(authMiddleware);
router.use(requireRole('master'));

router.get('/schedule', getAppointmentsForMaster);

module.exports = router;
