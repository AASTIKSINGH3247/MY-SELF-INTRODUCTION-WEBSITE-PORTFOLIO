const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'public/about.html')));
app.get('/certificates', (req, res) => res.sendFile(path.join(__dirname, 'public/certificates.html')));
app.get('/projects', (req, res) => res.sendFile(path.join(__dirname, 'public/projects.html')));
app.get('/social', (req, res) => res.sendFile(path.join(__dirname, 'public/social.html')));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
