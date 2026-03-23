const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

// --- CONFIGURATION ---
const BOT_TOKEN = '8703476678:AAHza1f1iGvykTF7YZBLtE62R3YVxoouVNI'; 
const CHAT_ID = '-1003882073026';
// Point this to your Local Bot API Server for 2GB support
const TELEGRAM_API = `http://localhost:8081/bot${BOT_TOKEN}`;

// --- UPLOAD ROUTE (Open to everyone) ---
app.post('/api/upload', upload.single('video'), async (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, error: "No file" });

    try {
        const form = new FormData();
        form.append('chat_id', CHAT_ID);
        form.append('video', fs.createReadStream(req.file.path));

        const response = await axios.post(`${TELEGRAM_API}/sendVideo`, form, {
            headers: form.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        fs.unlinkSync(req.file.path);
        res.json({ 
            success: true, 
            file_id: response.data.result.video.file_id,
            file_name: req.file.originalname 
        });
    } catch (err) {
        res.status(500).json({ success: false, error: "Upload failed" });
    }
});

// --- STREAMING ROUTE ---
app.get('/stream/:file_id', async (req, res) => {
    // ... keep the same streaming logic from before ...
});

app.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));
