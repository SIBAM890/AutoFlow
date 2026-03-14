const express = require('express');
const cors = require('cors');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://backend:8000/api/whatsapp/incoming';

let isConnected = false;
let currentQR = null;
let clientInfo = null;

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: '/app/.wwebjs_auth' }),
    puppeteer: {
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    currentQR = qr;
    console.log('QR RECEIVED', qr);
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
    isConnected = true;
    currentQR = null;
    clientInfo = client.info;
});

client.on('message', async msg => {
    // Only process actual messages from users
    if (msg.from === 'status@broadcast') return;

    try {
        console.log(`Received message from ${msg.from}: ${msg.body}`);
        await axios.post(WEBHOOK_URL, {
            from: msg.from,
            message: msg.body,
            timestamp: msg.timestamp
        });
    } catch (error) {
        console.error('Webhook push failed:', error.message);
    }
});

client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
    isConnected = false;
    currentQR = null;
    clientInfo = null;
});

client.initialize();

// REST API
app.get('/status', (req, res) => {
    res.json({
        connected: isConnected,
        qr: currentQR,
        phone: clientInfo ? clientInfo.wid.user : null
    });
});

app.get('/qr', (req, res) => {
    res.json({ qr: currentQR });
});

app.post('/send', async (req, res) => {
    const { to, message } = req.body;
    if (!to || !message) {
        return res.status(400).json({ error: "Missing 'to' or 'message'" });
    }
    
    try {
        const _to = to.includes('@c.us') ? to : `${to}@c.us`;
        await client.sendMessage(_to, message);
        res.json({ success: true, to: _to });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/broadcast', async (req, res) => {
    const { numbers, message } = req.body;
    if (!numbers || !Array.isArray(numbers) || !message) {
        return res.status(400).json({ error: "Invalid broadcast payload" });
    }

    let sent = 0;
    for (const num of numbers) {
        try {
            const _to = num.includes('@c.us') ? num : `${num}@c.us`;
            await client.sendMessage(_to, message);
            sent++;
        } catch (e) {
            console.error(`Failed sending to ${num}:`, e.message);
        }
    }
    res.json({ success: true, totalSent: sent });
});

app.listen(PORT, () => {
    console.log(`WhatsApp Bridge running on port ${PORT}`);
});
