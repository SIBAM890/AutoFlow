const express = require('express');
const cors = require('cors');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://backend:8000/api/whatsapp/incoming';
const AUTH_DIR = '/app/.wwebjs_auth';

// Cleanup stale Chromium locks from previous dirty exits
try {
    const { execSync } = require('child_process');
    execSync(`find ${AUTH_DIR} -name "Singleton*" -delete 2>/dev/null || true`);
    console.log('Removed stale Chromium SingletonLocks');
} catch (e) {
    console.error('Lock cleanup failed:', e.message);
}

let isConnected = false;
let currentQR = null;
let clientInfo = null;

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: AUTH_DIR }),
    puppeteer: {
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-extensions',
            '--disable-software-rasterizer',
            '--single-process'
        ],
        timeout: 120000,
        protocolTimeout: 120000
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

// Start Express server FIRST so /status endpoint is always available
app.listen(PORT, () => {
    console.log(`WhatsApp Bridge running on port ${PORT}`);
});

// Initialize WhatsApp client with retry logic (non-blocking)
const initWithRetry = async (maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            // Kill any stale Chromium processes and lock files before each attempt
            try {
                const { execSync } = require('child_process');
                execSync('pkill -f chromium 2>/dev/null || true');
                execSync(`find ${AUTH_DIR} -name "Singleton*" -delete 2>/dev/null || true`);
                execSync(`find ${AUTH_DIR} -name "*.lock" -delete 2>/dev/null || true`);
            } catch (e) { /* ignore cleanup errors */ }

            console.log(`WhatsApp client initializing (attempt ${attempt}/${maxRetries})...`);
            await client.initialize();
            console.log('WhatsApp client initialized successfully');
            return;
        } catch (err) {
            console.error(`Initialization attempt ${attempt} failed:`, err.message);
            if (attempt < maxRetries) {
                console.log(`Cleaning up and retrying in 15 seconds...`);
                await new Promise(r => setTimeout(r, 15000));
            } else {
                console.error('All initialization attempts failed. Server still running — retry manually or restart container.');
            }
        }
    }
};

initWithRetry();

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

