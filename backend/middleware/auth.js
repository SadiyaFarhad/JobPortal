const jwt = require('jsonwebtoken');
const User = require('../models/User');
const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';
module.exports = async function(req, res, next) {
  const h = req.headers.authorization;
  if (!h) return res.status(401).json({ message: 'No token' });
  const token = h.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) return res.status(401).json({ message: 'Invalid token' });
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};
