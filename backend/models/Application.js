
const mongoose = require('mongoose');
const ApplicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Applied','Shortlisted','Rejected','Hired'], default: 'Applied' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Application', ApplicationSchema);
