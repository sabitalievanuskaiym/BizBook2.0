const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      default: 'Bishkek',
      trim: true,
    },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    phone: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

branchSchema.index({ tenantId: 1 });

module.exports = mongoose.model('Branch', branchSchema);
