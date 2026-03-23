const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const app = express();

const upload = multer({ dest: 'uploads/' });
app.use(express.json());
app.use(express.static('public'));

// --- CONFIGURATION ---
const BOT_TOKEN = 'YOUR_NEW_BOT_TOKEN';
const CHAT_ID = 'YOUR_CHAT_ID';
// IMPORTANT: Use http://localhost:8081 for 2GB (Local Bot API Server)
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`; 

// Temporary memory to track daily uploads without messing up your JSON
let dailyTracker = {}; 

// --- LOGIN ROUTE ---
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const users = JSON.parse(fs.readFileSync('./users.json'));
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        res.json({ success: true, username: user.username, plan: user.plan });
    } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
    }
});

// --- UPLOAD ROUTE ---
app.post('/api/upload', upload.single('video'), async (req, res) => {
    const { username } = req.body;
    const users = JSON.parse(fs.readFileSync('./users.json'));
    const user = users.find(u => u.username === username);

    if (!user) return res.status(403).send("Unauthorized");

    // Initialize tracker for the user if it's their first upload today
    if (!dailyTracker[username]) dailyTracker[username] = 0;

    const fileSizeGB = req.file.size / (1024 * 1024 * 1024);

    // --- PLAN LOGIC ---
    if (user.plan === 'free') {
        if (dailyTracker[username] >= 5) return res.json({ success: false, error: "Daily limit of 5 reached!" });
        if (fileSizeGB > 1) return res.json({ success: false, error: "Free plan limit is 1GB!" });
    } else {
        // Pro Plan
        if (fileSizeGB > 2) return res.json({ success: false, error: "Max limit is 2GB!" });
    }

    try {
        const form = new FormData();
        form.append('chat_id', CHAT_ID);
        form.append('video', fs.createReadStream(req.file.path));

        const response = await axios.post(`${TELEGRAM_API}/sendVideo`, form, {
            headers: form.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        // Update Tracker & Cleanup
        dailyTracker[username]++;
        fs.unlinkSync(req.file.path);

        res.json({ 
            success: true, 
            file_id: response.data.result.video.file_id,
            file_name: req.file.originalname 
        });
    } catch (err) {
        res.json({ success: false, error: "Telegram Upload Failed" });
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));
