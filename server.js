// server.js
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Initialize Express and HTTP server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Sessions
app.use(session({
  secret: 'voicechanger-secret',
  resave: false,
  saveUninitialized: false,
}));

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({ dialect: 'sqlite', storage: 'database.sqlite' });

// Define User model
const User = sequelize.define('User', {
  username: { type: DataTypes.STRING, unique: true },
  contact: DataTypes.STRING,
  dob: DataTypes.DATEONLY,
  place: DataTypes.STRING,
  passwordHash: DataTypes.STRING,
}, {
  timestamps: true // adds createdAt
});

(async () => {
  await sequelize.sync();
})();

// Register route
app.post('/api/register', async (req, res) => {
  const { username, contact, dob, place, password } = req.body;
  try {
    const user = await User.create({ username, contact, dob, place, passwordHash: password });
    req.session.userId = user.id;
    // Broadcast new registration
    io.emit('new-registration', { username, time: user.createdAt });
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Login route
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username } });
  if (user && user.passwordHash === password) {
    req.session.userId = user.id;
    io.emit('user-login', { username, time: new Date() });
    return res.json({ success: true });
  }
  res.json({ success: false, error: 'Invalid credentials' });
});

// API to get recent registrations
app.get('/api/recent-registrations', async (req, res) => {
  const users = await User.findAll({ order: [['createdAt', 'DESC']], limit: 10 });
  res.json(users.map(u => ({ username: u.username, time: u.createdAt })));
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.io connections
io.on('connection', socket => {
  console.log('Client connected');
  socket.on('disconnect', () => console.log('Client disconnected'));
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
