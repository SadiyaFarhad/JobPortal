
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const User = require('../models/User');

const profileDir = path.join(__dirname, '../uploads/profile');
const docsDir = path.join(__dirname, '../uploads/docs');
if (!fs.existsSync(profileDir)) fs.mkdirSync(profileDir, { recursive: true });
if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'photo') cb(null, profileDir);
    else cb(null, docsDir);
  },
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.post('/profile-photo', auth, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file' });
    const rel = '/uploads/profile/' + req.file.filename;
    await User.findByIdAndUpdate(req.user._id, { profilePhoto: rel });
    res.json({ url: rel });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Upload error' });
  }
});

router.post('/student-docs', auth, upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'doc10', maxCount: 1 },
  { name: 'doc12', maxCount: 1 },
  { name: 'ug', maxCount: 1 },
  { name: 'pg', maxCount: 1 }
]), async (req, res) => {
  try {
    const files = req.files;
    const paths = {};
    for (const k in files) paths[k] = '/uploads/docs/' + files[k][0].filename;
    await User.findByIdAndUpdate(req.user._id, { $set: { documents: paths } });
    res.json({ message: 'Uploaded', files: paths });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Upload error' });
  }
});

module.exports = router;
