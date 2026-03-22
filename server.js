const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' }); // Temporary storage for chunks

const BOT_TOKEN = '8703476678:AAGosSnHf5Tg6voJtgvjcmjdCP_vhB284OY';
const CHAT_ID = '-1003882073026';
// If running local API server, change this URL. Otherwise, 50MB is the limit.
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

app.use(express.static('public')); // Serves your HTML/CSS/JS

app.post('/upload', upload.single('video'), async (req, res) => {
    try {
        const file = req.file;
        const form = new FormData();
        form.append('chat_id', CHAT_ID);
        form.append('video', fs.createReadStream(file.path));

        // Sending to Telegram
        const response = await axios.post(`${TELEGRAM_API}/sendVideo`, form, {
            headers: form.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        // Clean up temp file
        fs.unlinkSync(file.path);

        // Send the file details back to frontend
        res.json({
            success: true,
            file_id: response.data.result.video.file_id,
            file_name: file.originalname
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
