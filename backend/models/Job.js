
const mongoose = require('mongoose');
const JobSchema = new mongoose.Schema({
  title: String,
  salary: String,
  country: String,
  workMode: String,
  jd: String,
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Job', JobSchema);
