const mongoose = require('mongoose');

const masterSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      default: 5,
      min: 0,
      max: 5,
    },
    avatar: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

masterSchema.index({ branchId: 1 });
masterSchema.index({ tenantId: 1 });

module.exports = mongoose.model('Master', masterSchema);
