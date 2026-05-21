const Appointment = require('../models/Appointment');
const Branch = require('../models/Branch');
const Master = require('../models/Master');
const telegramService = require('../services/telegramService');

const WORK_START = 9;
const WORK_END = 20;
const SLOT_INTERVAL = 30;

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = WORK_START; hour < WORK_END; hour += 1) {
    for (const minute of [0, 30]) {
      const h = String(hour).padStart(2, '0');
      const m = String(minute).padStart(2, '0');
      slots.push(`${h}:${m}`);
    }
  }
  return slots;
};

const getTodayString = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getBranches = async (req, res) => {
  try {
    const branches = await Branch.find({ tenantId: req.tenantId }).sort({ name: 1 });
    res.json({ branches });
  } catch (error) {
    console.error('getBranches error:', error);
    res.status(500).json({ message: 'Failed to fetch branches.' });
  }
};

const getMastersByBranch = async (req, res) => {
  try {
    const { branchId } = req.params;
    const branch = await Branch.findOne({ _id: branchId, tenantId: req.tenantId });
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found.' });
    }

    const masters = await Master.find({ tenantId: req.tenantId, branchId }).sort({ rating: -1 });
    res.json({ masters });
  } catch (error) {
    console.error('getMastersByBranch error:', error);
    res.status(500).json({ message: 'Failed to fetch masters.' });
  }
};

const getAvailableSlots = async (req, res) => {
  try {
    const { branchId, masterId, date } = req.query;

    if (!branchId || !masterId || !date) {
      return res.status(400).json({ message: 'branchId, masterId, and date are required.' });
    }

    const branch = await Branch.findOne({ _id: branchId, tenantId: req.tenantId });
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found.' });
    }

    const master = await Master.findOne({ _id: masterId, tenantId: req.tenantId, branchId });
    if (!master) {
      return res.status(404).json({ message: 'Master not found.' });
    }

    const booked = await Appointment.find({
      tenantId: req.tenantId,
      branchId,
      masterId,
      date,
      status: { $ne: 'cancelled' },
    }).select('time');

    const bookedTimes = new Set(booked.map((a) => a.time));
    const allSlots = generateTimeSlots();
    const today = getTodayString();
    const now = new Date();

    const available = allSlots.filter((slot) => {
      if (bookedTimes.has(slot)) return false;
      if (date === today) {
        const [h, m] = slot.split(':').map(Number);
        const slotDate = new Date();
        slotDate.setHours(h, m, 0, 0);
        if (slotDate <= now) return false;
      }
      return true;
    });

    res.json({ slots: available });
  } catch (error) {
    console.error('getAvailableSlots error:', error);
    res.status(500).json({ message: 'Failed to fetch time slots.' });
  }
};

const createAppointment = async (req, res) => {
  try {
    const {
      branchId,
      masterId,
      clientName,
      clientPhone,
      serviceName,
      price,
      date,
      time,
    } = req.body;

    if (!branchId || !masterId || !clientName || !clientPhone || !serviceName || !price || !date || !time) {
      return res.status(400).json({ message: 'All booking fields are required.' });
    }

    const branch = await Branch.findOne({ _id: branchId, tenantId: req.tenantId });
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found.' });
    }

    const master = await Master.findOne({ _id: masterId, tenantId: req.tenantId, branchId });
    if (!master) {
      return res.status(404).json({ message: 'Master not found.' });
    }

    const conflict = await Appointment.findOne({
      tenantId: req.tenantId,
      branchId,
      masterId,
      date,
      time,
      status: { $ne: 'cancelled' },
    });

    if (conflict) {
      return res.status(409).json({ message: 'This time slot is no longer available.' });
    }

    const clientId =
      req.user?.id && req.user.tenantId === req.tenantId.toString() ? req.user.id : null;

    const appointment = await Appointment.create({
      tenantId: req.tenantId,
      branchId,
      masterId,
      clientId,
      clientName,
      clientPhone,
      serviceName,
      price: Number(price),
      date,
      time,
      status: 'pending',
    });

    const notificationPayload = {
      clientName,
      clientPhone,
      serviceName,
      price: Number(price),
      date,
      time,
      status: 'pending',
      branchAddress: `${branch.address}, ${branch.city}`,
    };

    telegramService
      .sendBookingNotification(notificationPayload, branch.name, master.name)
      .catch((err) => console.error('Telegram booking notification failed:', err));

    res.status(201).json({
      message: 'Appointment created successfully.',
      appointment,
    });
  } catch (error) {
    console.error('createAppointment error:', error);
    res.status(500).json({ message: 'Failed to create appointment.' });
  }
};

const getClientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      tenantId: req.tenantId,
      clientId: req.user.id,
    })
      .populate('branchId', 'name address city')
      .populate('masterId', 'name')
      .sort({ date: -1, time: -1 });

    res.json({ appointments });
  } catch (error) {
    console.error('getClientAppointments error:', error);
    res.status(500).json({ message: 'Failed to fetch appointments.' });
  }
};

module.exports = {
  getBranches,
  getMastersByBranch,
  getAvailableSlots,
  createAppointment,
  getClientAppointments,
};
