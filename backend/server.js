
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const authRoutes = require('./routes/auth');
const jobsRoutes = require('./routes/jobs');
const appsRoutes = require('./routes/applications');
const uploadsRoutes = require('./routes/uploads');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: true } });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.set('io', io);

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/applications', appsRoutes);
app.use('/api/uploads', uploadsRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jobportal';

mongoose.connect(MONGO_URI).then(() => console.log('✅ MongoDB connected')).catch(console.error);

io.on('connection', socket => {
  console.log('Socket connected', socket.id);
  socket.on('statusUpdate', d => io.emit('statusUpdated', d));
});

server.listen(PORT, () => console.log('🚀 Server running on', PORT));
