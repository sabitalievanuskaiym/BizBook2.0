const jwt = require('jsonwebtoken');

const signToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
      tenantId: user.tenantId.toString(),
      masterId: user.masterId ? user.masterId.toString() : null,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

module.exports = { signToken };
