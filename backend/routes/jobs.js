
const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Application = require('../models/Application');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') return res.status(403).json({ message: 'Only recruiters' });
    const { title, salary, country, workMode, jd } = req.body;
    const job = new Job({ title, salary, country, workMode, jd, recruiter: req.user._id });
    await job.save();
    res.json(job);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find().populate('recruiter','name profilePhoto');
    const jobsWithCount = await Promise.all(jobs.map(async j => {
      const count = await Application.countDocuments({ job: j._id });
      return Object.assign({}, j.toObject(), { applicantCount: count });
    }));
    res.json(jobsWithCount);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
