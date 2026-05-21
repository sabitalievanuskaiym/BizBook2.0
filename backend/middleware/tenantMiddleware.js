const Tenant = require('../models/Tenant');

const tenantMiddleware = async (req, res, next) => {
  const tenantIdHeader = req.headers['x-tenant-id'];
  const tenantSlugHeader = req.headers['x-tenant-slug'];

  if (!tenantIdHeader && !tenantSlugHeader) {
    return res.status(400).json({
      message: 'Tenant context required. Provide X-Tenant-ID or X-Tenant-Slug header.',
    });
  }

  try {
    let tenant;

    if (tenantIdHeader) {
      tenant = await Tenant.findById(tenantIdHeader);
    } else {
      tenant = await Tenant.findOne({ slug: tenantSlugHeader.toLowerCase().trim() });
    }

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found.' });
    }

    req.tenantId = tenant._id;
    req.tenant = tenant;
    next();
  } catch (error) {
    return res.status(400).json({ message: 'Invalid tenant identifier.' });
  }
};

module.exports = tenantMiddleware;
