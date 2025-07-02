const express = require('express');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 5000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Setup Multer for voice uploads
const storage = multer.diskStorage({
  destination: 'server/uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });
// Contact form submission
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  console.log('New Contact Message:', { name, email, message });
  res.status(200).json({ message: 'Message received successfully!' });
});

// Voice upload endpoint
app.post('/api/voice-upload', upload.single('voice'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.status(200).json({ filePath: `/uploads/${req.file.filename}` });
});

// Certification API
app.get('/api/certification', (req, res) => {
  res.json({
    certificateId: 'DAC-2025-VC001',
    issuedBy: 'AudioTech Labs',
    validUntil: '2027-12-31'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
