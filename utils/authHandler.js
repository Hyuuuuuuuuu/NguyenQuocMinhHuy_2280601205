// utils/authHandler.js
const jwt = require('jsonwebtoken');

// Middleware kiểm tra user có đăng nhập chưa
function Authentication(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    req.user = decoded; // Lưu thông tin user vào request
    next();
  } catch (err) {
    return res.status(400).json({ message: 'Invalid token.' });
  }
}

// Middleware kiểm tra quyền hạn (roles)
function Authorization(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Access denied. You do not have permission.' });
    }

    next();
  };
}

module.exports = { Authentication, Authorization };
