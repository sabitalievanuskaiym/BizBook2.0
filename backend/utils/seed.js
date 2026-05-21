const Tenant = require('../models/Tenant');
const Branch = require('../models/Branch');
const Master = require('../models/Master');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const bcrypt = require('bcryptjs');

const seedDemoData = async () => {
  const existing = await Tenant.findOne({ slug: 'elite-barbers' });
  if (existing) return existing;

  const tenant = await Tenant.create({
    name: 'Elite Barbers Network',
    slug: 'elite-barbers',
  });

  const branches = await Branch.insertMany([
    {
      tenantId: tenant._id,
      name: 'Elite Downtown',
      address: 'Chui Ave 123, Bishkek',
      city: 'Bishkek',
      coordinates: { lat: 42.8746, lng: 74.5698 },
      phone: '+996 555 111 001',
    },
    {
      tenantId: tenant._id,
      name: 'Elite Ala-Too',
      address: 'Sovetskaya 45, Bishkek',
      city: 'Bishkek',
      coordinates: { lat: 42.882, lng: 74.607 },
      phone: '+996 555 111 002',
    },
    {
      tenantId: tenant._id,
      name: 'Elite Dordoi',
      address: '7 Aprel 88, Bishkek',
      city: 'Bishkek',
      coordinates: { lat: 42.856, lng: 74.62 },
      phone: '+996 555 111 003',
    },
  ]);

  const masters = await Master.insertMany([
    {
      tenantId: tenant._id,
      branchId: branches[0]._id,
      name: 'Azamat K.',
      skills: ['Classic Cut', 'Beard Trim', 'Hot Towel Shave'],
      rating: 4.9,
      avatar: '',
    },
    {
      tenantId: tenant._id,
      branchId: branches[0]._id,
      name: 'Nurlan B.',
      skills: ['Fade', 'Line Up', 'Kids Cut'],
      rating: 4.8,
      avatar: '',
    },
    {
      tenantId: tenant._id,
      branchId: branches[1]._id,
      name: 'Daniyar M.',
      skills: ['Premium Cut', 'Beard Sculpt', 'Hair Coloring'],
      rating: 4.7,
      avatar: '',
    },
    {
      tenantId: tenant._id,
      branchId: branches[2]._id,
      name: 'Erlan S.',
      skills: ['Buzz Cut', 'Beard Trim', 'Classic Cut'],
      rating: 4.6,
      avatar: '',
    },
  ]);

  const passwordHash = await bcrypt.hash('admin123', 10);
  const masterPasswordHash = await bcrypt.hash('master123', 10);

  const users = await User.insertMany([
    {
      tenantId: tenant._id,
      name: 'BizBook Admin',
      email: 'admin@elite-barbers.kg',
      password: passwordHash,
      role: 'admin',
      bonusBalance: 0,
    },
    {
      tenantId: tenant._id,
      name: 'Azamat K.',
      email: 'azamat@elite-barbers.kg',
      password: masterPasswordHash,
      role: 'master',
      masterId: masters[0]._id,
      bonusBalance: 0,
    },
    {
      tenantId: tenant._id,
      name: 'Demo Client',
      email: 'client@elite-barbers.kg',
      password: await bcrypt.hash('client123', 10),
      role: 'client',
      bonusBalance: 150,
    },
  ]);

  const clientUser = users.find((u) => u.role === 'client');
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  await Appointment.insertMany([
    {
      tenantId: tenant._id,
      branchId: branches[0]._id,
      masterId: masters[0]._id,
      clientId: clientUser._id,
      clientName: clientUser.name,
      clientPhone: '+996 700 000 001',
      serviceName: 'Classic Cut',
      price: 800,
      date: month + '-05',
      time: '10:00',
      status: 'completed',
    },
    {
      tenantId: tenant._id,
      branchId: branches[0]._id,
      masterId: masters[0]._id,
      clientId: clientUser._id,
      clientName: clientUser.name,
      clientPhone: '+996 700 000 001',
      serviceName: 'Beard Trim',
      price: 500,
      date: month + '-12',
      time: '14:30',
      status: 'completed',
    },
    {
      tenantId: tenant._id,
      branchId: branches[1]._id,
      masterId: masters[2]._id,
      clientId: clientUser._id,
      clientName: clientUser.name,
      clientPhone: '+996 700 000 001',
      serviceName: 'Premium Cut',
      price: 1500,
      date: today,
      time: '11:00',
      status: 'pending',
    },
  ]);

  console.log('Demo tenant seeded: elite-barbers');
  return tenant;
};

module.exports = { seedDemoData };
