const express = require('express');
const {
  getBranches,
  getMastersByBranch,
  getAvailableSlots,
  createAppointment,
  getClientAppointments,
} = require('../controllers/appointmentController');
const { authMiddleware, optionalAuth, requireRole } = require('../middleware/authMiddleware');
const { updateAppointmentStatus } = require('../controllers/staffController');
const tenantMiddleware = require('../middleware/tenantMiddleware');

const router = express.Router();

router.use(tenantMiddleware);

router.get('/branches', getBranches);
router.get('/masters/:branchId', getMastersByBranch);
router.get('/slots', getAvailableSlots);

router.post('/', optionalAuth, createAppointment);

router.get('/my', authMiddleware, getClientAppointments);

router.patch('/:id', authMiddleware, requireRole('master'), updateAppointmentStatus);

module.exports = router;
