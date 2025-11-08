
const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  role: { type: String, enum: ['student','recruiter'] },
  profilePhoto: String,
  dob: String,
  gender: String,
  college: String,
  company: String,
  documents: { doc10: String, doc12: String, ug: String, pg: String, resume: String }
});
module.exports = mongoose.model('User', UserSchema);
