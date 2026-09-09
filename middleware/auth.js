const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next({ status: 401, message: 'Authorization token required' });
  }

  const token = header.slice(7).trim();
  if (!token) {
    return next({ status: 401, message: 'Authorization token required' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return next({ status: 500, message: 'JWT_SECRET is not configured' });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    return next();
  } catch (err) {
    return next({ status: 401, message: 'Invalid or expired token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next({ status: 401, message: 'Authorization token required' });
    }
    if (!roles.includes(req.user.role)) {
      return next({ status: 403, message: 'Forbidden: insufficient role' });
    }
    return next();
  };
}

module.exports = { authenticate, requireRole };
