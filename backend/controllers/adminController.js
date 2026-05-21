const Appointment = require('../models/Appointment');
const mongoose = require('mongoose');

const getAnalyticsData = async (req, res) => {
  try {
    const tenantObjectId = new mongoose.Types.ObjectId(req.tenantId);

    const [revenueStats, branchRevenue, masterPerformance, monthlyGrowth] = await Promise.all([
      Appointment.aggregate([
        { $match: { tenantId: tenantObjectId, status: 'completed' } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$price' },
            totalBookings: { $sum: 1 },
          },
        },
      ]),
      Appointment.aggregate([
        { $match: { tenantId: tenantObjectId, status: 'completed' } },
        {
          $group: {
            _id: '$branchId',
            revenue: { $sum: '$price' },
            bookings: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: 'branches',
            localField: '_id',
            foreignField: '_id',
            as: 'branch',
          },
        },
        { $unwind: '$branch' },
        {
          $project: {
            branchId: '$_id',
            branchName: '$branch.name',
            revenue: 1,
            bookings: 1,
          },
        },
        { $sort: { revenue: -1 } },
      ]),
      Appointment.aggregate([
        { $match: { tenantId: tenantObjectId, status: 'completed' } },
        {
          $group: {
            _id: '$masterId',
            revenue: { $sum: '$price' },
            bookings: { $sum: 1 },
            avgTicket: { $avg: '$price' },
          },
        },
        {
          $lookup: {
            from: 'masters',
            localField: '_id',
            foreignField: '_id',
            as: 'master',
          },
        },
        { $unwind: '$master' },
        {
          $project: {
            masterId: '$_id',
            masterName: '$master.name',
            revenue: 1,
            bookings: 1,
            avgTicket: { $round: ['$avgTicket', 0] },
            rating: '$master.rating',
          },
        },
        { $sort: { revenue: -1 } },
      ]),
      Appointment.aggregate([
        { $match: { tenantId: tenantObjectId } },
        {
          $addFields: {
            yearMonth: { $substr: ['$date', 0, 7] },
          },
        },
        {
          $group: {
            _id: '$yearMonth',
            bookings: { $sum: 1 },
            revenue: {
              $sum: {
                $cond: [{ $eq: ['$status', 'completed'] }, '$price', 0],
              },
            },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 12 },
      ]),
    ]);

    const totalBookingsAll = await Appointment.countDocuments({ tenantId: req.tenantId });
    const pendingBookings = await Appointment.countDocuments({
      tenantId: req.tenantId,
      status: 'pending',
    });

    const stats = revenueStats[0] || { totalRevenue: 0, totalBookings: 0 };

    res.json({
      totalRevenue: stats.totalRevenue || 0,
      totalBookings: stats.totalBookings || 0,
      totalBookingsAll,
      pendingBookings,
      revenuePerBranch: branchRevenue,
      masterPerformance,
      monthlyGrowth: monthlyGrowth.map((m) => ({
        month: m._id,
        bookings: m.bookings,
        revenue: m.revenue,
      })),
    });
  } catch (error) {
    console.error('getAnalyticsData error:', error);
    res.status(500).json({ message: 'Failed to load analytics.' });
  }
};

const getTenantInfo = async (req, res) => {
  res.json({
    tenant: {
      id: req.tenant._id,
      name: req.tenant.name,
      slug: req.tenant.slug,
    },
  });
};

module.exports = { getAnalyticsData, getTenantInfo };
