const Appointment = require('../models/Appointment');
const User = require('../models/User');
const telegramService = require('../services/telegramService');

const getTodayString = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getAppointmentsForMaster = async (req, res) => {
  try {
    const masterId = req.user.masterId;

    if (!masterId) {
      return res.status(400).json({ message: 'No master profile linked to this account.' });
    }

    const today = getTodayString();

    const appointments = await Appointment.find({
      tenantId: req.tenantId,
      masterId,
      date: today,
    })
      .populate('branchId', 'name address phone')
      .sort({ time: 1 });

    res.json({ date: today, appointments });
  } catch (error) {
    console.error('getAppointmentsForMaster error:', error);
    res.status(500).json({ message: 'Failed to fetch schedule.' });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Status must be completed or cancelled.' });
    }

    const masterId = req.user.masterId;
    if (!masterId) {
      return res.status(400).json({ message: 'No master profile linked to this account.' });
    }

    const appointment = await Appointment.findOne({
      _id: id,
      tenantId: req.tenantId,
      masterId,
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found or access denied.' });
    }

    if (appointment.status === status) {
      return res.json({ message: 'Status unchanged.', appointment });
    }

    const previousStatus = appointment.status;
    appointment.status = status;
    await appointment.save();

    const shouldApplyCashback =
      status === 'completed' &&
      previousStatus !== 'completed' &&
      appointment.clientId;

    if (shouldApplyCashback) {
      const cashback = Math.round(appointment.price * 0.05);
      if (cashback > 0) {
        await User.findByIdAndUpdate(appointment.clientId, {
          $inc: { bonusBalance: cashback },
        });
      }
    }

    if (status === 'cancelled') {
      telegramService
        .sendCancellationNotification({
          clientName: appointment.clientName,
          clientPhone: appointment.clientPhone,
          serviceName: appointment.serviceName,
          date: appointment.date,
          time: appointment.time,
        })
        .catch((err) => console.error('Telegram cancellation notification failed:', err));
    }

    const cashbackApplied = shouldApplyCashback ? Math.round(appointment.price * 0.05) : 0;

    res.json({
      message: `Appointment marked as ${status}.`,
      appointment,
      cashbackApplied,
    });
  } catch (error) {
    console.error('updateAppointmentStatus error:', error);
    res.status(500).json({ message: 'Failed to update appointment.' });
  }
};

module.exports = { getAppointmentsForMaster, updateAppointmentStatus };
