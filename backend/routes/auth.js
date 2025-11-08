
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ message: 'Missing fields' });
    if (await User.findOne({ email })) return res.status(400).json({ message: 'Email exists' });
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const u = new User({ name, email, passwordHash, role });
    await u.save();
    const token = jwt.sign({ id: u._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: { id: u._id, name: u.name, email: u.email, role: u.role, profilePhoto: u.profilePhoto }, token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing' });
    const u = await User.findOne({ email });
    if (!u) return res.status(400).json({ message: 'Invalid' });
    const ok = await bcrypt.compare(password, u.passwordHash);
    if (!ok) return res.status(400).json({ message: 'Invalid' });
    const token = jwt.sign({ id: u._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: { id: u._id, name: u.name, email: u.email, role: u.role, profilePhoto: u.profilePhoto }, token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/me', require('../middleware/auth'), async (req, res) => {
  try {
    const u = await User.findById(req.user._id).select('-passwordHash');
    res.json({ user: u });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
