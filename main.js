// main.js

// =========================
// Dependencies (if using Socket.io)
// =========================
// <script src="/socket.io/socket.io.js"></script> must be in your HTML
let socket;
if (typeof io !== 'undefined') {
  socket = io();
  // Example real‑time handlers:
  socket.on('new-registration', data => {
    console.log('New registration:', data);
    // Update a live UI element if desired
  });
  socket.on('user-login', data => {
    console.log('User login:', data);
  });
}

// =========================
// Helper: Get current page by body ID or path
// =========================
function getPage() {
  return document.body.dataset.page || window.location.pathname.split('/').pop();
}

// =========================
// Auth: Login & Register
// =========================
async function login() {
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;
  if (!username || !password) {
    return alert("Please fill both fields.");
  }

  const res = await fetch('/api/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();

  if (data.success) {
    window.location.href = 'dashboard.html';
  } else {
    alert(data.error || "Login failed");
  }
}

async function register() {
  const username = document.getElementById("registerUsername").value.trim();
  const password = document.getElementById("registerPassword").value;
  if (!username || !password) {
    return alert("Please fill both fields.");
  }

  const res = await fetch('/api/register', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();

  if (data.success) {
    alert("Registration successful. Please login.");
    window.location.href = 'index.html';
  } else {
    alert(data.error || "Registration failed");
  }
}

// =========================
// Dashboard Load
// =========================
async function loadDashboard() {
  try {
    const res = await fetch('/api/dashboard');
    const data = await res.json();
    if (data.credits !== undefined) {
      document.getElementById('credits').innerText = `Credits: ${data.credits}`;
    } else {
      // not logged in
      window.location.href = 'index.html';
    }
  } catch (err) {
    console.error(err);
    window.location.href = 'index.html';
  }
}

// =========================
// Upload Voice & Change
// =========================
async function uploadVoiceChange() {
  const voiceFile = document.getElementById('voiceFile').files[0];
  const voiceType = document.getElementById('voiceType').value;

  if (!voiceFile) {
    return alert("Please select a voice file.");
  }

  const formData = new FormData();
  formData.append('voice', voiceFile);
  formData.append('type', voiceType);

  const response = await fetch('/api/voice-change', {
    method: 'POST',
    body: formData
  });
  const data = await response.json();

  if (data.error) {
    alert(data.error);
  } else {
    document.getElementById('credits').innerText = `Credits: ${data.credits}`;
    document.getElementById('status').innerText = data.message || "Voice changed!";
    const audio = document.getElementById('resultAudio');
    audio.src = data.fileUrl;
    audio.hidden = false;
    audio.play();
  }
}

// =========================
// Voice Options Generator
// =========================
function populateVoiceTypes() {
  const voiceSelect = document.getElementById('voiceType');
  if (!voiceSelect) return;

  const voices = [
    'Adult Female', 'Adult Male', 'Teen Girl', 'Teen Boy',
    'Child Girl', 'Child Boy', 'Cartoon Kid', 'Robot', 'Alien',
    'Elderly Male', 'Elderly Female', 'Deep Voice', 'Cute Voice'
  ];
  voices.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = v;
    voiceSelect.appendChild(opt);
  });
}

// =========================
// Logout
// =========================
function logout() {
  fetch('/api/logout', { method: 'POST' }).then(() => {
    window.location.href = 'index.html';
  });
}

// =========================
// Init on DOMContentLoaded
// =========================
document.addEventListener('DOMContentLoaded', () => {
  const page = getPage();

  // Login page (assume index.html)
  if (page === 'index.html' || page === '') {
    document.getElementById('loginBtn')?.addEventListener('click', login);
  }

  // Register page
  if (page === 'register.html') {
    document.getElementById('registerBtn')?.addEventListener('click', register);
  }

  // Dashboard page
  if (page === 'dashboard.html') {
    // Populate voice dropdown
    populateVoiceTypes();

    // Load user credits
    loadDashboard();

    // Hook upload button
    document.getElementById('uploadBtn')?.addEventListener('click', uploadVoiceChange);

    // Hook logout link/button
    document.getElementById('logoutLink')?.addEventListener('click', logout);
  }
});
