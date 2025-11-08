
const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ message: 'Only students' });
    const { jobId } = req.body;
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    const existing = await Application.findOne({ job: job._id, student: req.user._id });
    if (existing) return res.status(400).json({ message: 'Already applied' });
    const app = new Application({ job: job._id, student: req.user._id });
    await app.save();
    res.json(app);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/my', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ message: 'Only students' });
    const apps = await Application.find({ student: req.user._id }).populate('job');
    res.json(apps);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/recruiter', auth, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') return res.status(403).json({ message: 'Only recruiters' });
    const jobs = await Job.find({ recruiter: req.user._id }).select('_id');
    const ids = jobs.map(j => j._id);
    const apps = await Application.find({ job: { $in: ids } }).populate('job','title recruiter').populate('student','name email profilePhoto documents');
    res.json(apps);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const app = await Application.findById(req.params.id).populate('job');
    if (!app) return res.status(404).json({ message: 'Not found' });
    if (req.user.role !== 'recruiter' || String(app.job.recruiter) !== String(req.user._id)) return res.status(403).json({ message: 'Not allowed' });
    app.status = status;
    await app.save();
    const io = req.app.get('io');
    if (io) io.emit('statusUpdated', { applicationId: app._id, status });
    res.json(app);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
