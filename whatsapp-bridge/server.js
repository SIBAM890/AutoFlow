const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const qrcode = require('qrcode-terminal');
const makeWASocket = require('baileys').default;
const { useMultiFileAuthState, DisconnectReason } = require('baileys');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://backend:8000/api/whatsapp/incoming';
const AUTH_DIR = '/app/auth_info_baileys';

// ─── Global State ────────────────────────────────────────
let sock = null;
let isConnected = false;
let isConnecting = false;
let qrCode = null;
let reconnectAttempts = 0;
const MAX_RECONNECT = 10;

// ─── WhatsApp Connection ─────────────────────────────────
const connectToWhatsApp = async () => {
    if (isConnected) {
        console.log('⚠️ WhatsApp already connected.');
        return { status: 'already_connected' };
    }
    if (isConnecting) {
        console.log('⚠️ WhatsApp connection already in progress.');
        return { status: 'connecting' };
    }

    isConnecting = true;
    qrCode = null;

    // Cleanup previous socket
    if (sock) {
        try {
            sock.ev.removeAllListeners();
            sock.end();
            sock = null;
        } catch (e) {
            console.error('Cleanup error:', e.message);
        }
    }

    try {
        const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

        sock = makeWASocket({
            auth: state,
            printQRInTerminal: false, // We handle QR ourselves
            logger: require('pino')({ level: 'silent' }),
            browser: ['AutoFlow', 'Chrome', '1.0.0']
        });

        // Save credentials
        sock.ev.on('creds.update', async () => {
            try {
                await saveCreds();
            } catch (e) {
                // Ignore
            }
        });

        // Connection update handler
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            // ── QR Code ────────────────────
            if (qr) {
                console.log('\n📸 ═══════ SCAN THIS QR CODE ═══════');
                qrcode.generate(qr, { small: true });
                console.log('════════════════════════════════════\n');
                qrCode = qr;
                reconnectAttempts = 0; // Reset on QR (we're making progress)
            }

            // ── Connection Opened ──────────
            if (connection === 'open') {
                console.log('✅ WhatsApp Connected Successfully!');
                isConnected = true;
                isConnecting = false;
                qrCode = null;
                reconnectAttempts = 0;
            }

            // ── Connection Closed ──────────
            if (connection === 'close') {
                isConnected = false;

                const statusCode = lastDisconnect?.error?.output?.statusCode;
                // 401 = Logged Out
                // 405 = Not Acceptable / Corrupt Session Data
                const shouldReconnect = statusCode !== DisconnectReason.loggedOut && statusCode !== 405;

                console.log(`Connection closed. Status: ${statusCode || 'initial'}, Reconnect: ${shouldReconnect}`);

                // Cleanup
                try { sock?.ev?.removeAllListeners(); } catch (e) { }
                try { sock?.end(); } catch (e) { }
                sock = null;
                isConnecting = false;

                if (!shouldReconnect) {
                    // Logged out — clear session
                    console.log('⚠️ Logged out. Clearing session...');
                    qrCode = null;
                    reconnectAttempts = 0;
                    try {
                        await new Promise(r => setTimeout(r, 500));
                        if (fs.existsSync(AUTH_DIR)) {
                            const files = fs.readdirSync(AUTH_DIR);
                            for (const file of files) {
                                fs.rmSync(`${AUTH_DIR}/${file}`, { recursive: true, force: true });
                            }
                        }
                        console.log('📂 Session cleared. Call /deploy to reconnect.');
                    } catch (e) {
                        console.error('Failed to delete session:', e.message);
                    }
                } else if (reconnectAttempts < MAX_RECONNECT) {
                    reconnectAttempts++;
                    const delay = Math.min(3000 * reconnectAttempts, 30000); // Exponential backoff, max 30s
                    console.log(`🔄 Reconnecting (${reconnectAttempts}/${MAX_RECONNECT}) in ${delay / 1000}s...`);
                    setTimeout(() => connectToWhatsApp(), delay);
                } else {
                    console.error(`❌ Max reconnect attempts (${MAX_RECONNECT}) reached. Call /deploy to retry.`);
                    reconnectAttempts = 0;
                }
            }
        });

        // ── Incoming Messages ────────────
        sock.ev.on('messages.upsert', async ({ messages }) => {
            const msg = messages[0];
            if (!msg.message || msg.key.fromMe) return;

            const sender = msg.key.remoteJid;
            if (sender === 'status@broadcast') return;

            const userMessage =
                msg.message.conversation ||
                msg.message.extendedTextMessage?.text ||
                msg.message.imageMessage?.caption ||
                null;

            if (!userMessage) return;

            console.log(`📩 Message from ${sender}: ${userMessage}`);

            try {
                await axios.post(WEBHOOK_URL, {
                    from: sender,
                    message: userMessage,
                    timestamp: Math.floor(Date.now() / 1000)
                });
            } catch (error) {
                console.error('Webhook push failed:', error.message);
            }
        });

        return { status: 'initiated' };

    } catch (e) {
        console.error('❌ Connection Failed:', e.message);
        isConnecting = false;
        return { error: e.message };
    }
};

// ─── REST API ────────────────────────────────────────────

app.get('/status', (req, res) => {
    res.json({
        success: true,
        connected: isConnected,
        connecting: isConnecting,
        qr: qrCode,
        reconnectAttempts
    });
});

app.get('/qr', (req, res) => {
    res.json({ qr: qrCode });
});

app.post('/deploy', async (req, res) => {
    reconnectAttempts = 0; // Reset on manual deploy
    isConnecting = false;  // Allow fresh connection
    const result = await connectToWhatsApp();
    res.json(result);
});

app.post('/send', async (req, res) => {
    const { to, message } = req.body;
    if (!to || !message) {
        return res.status(400).json({ error: "Missing 'to' or 'message'" });
    }
    if (!isConnected || !sock) {
        return res.status(503).json({ error: 'WhatsApp not connected' });
    }

    try {
        const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;
        await sock.sendMessage(jid, { text: message });
        res.json({ success: true, to: jid });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/broadcast', async (req, res) => {
    const { numbers, message } = req.body;
    if (!numbers || !Array.isArray(numbers) || !message) {
        return res.status(400).json({ error: 'Invalid broadcast payload' });
    }
    if (!isConnected || !sock) {
        return res.status(503).json({ error: 'WhatsApp not connected' });
    }

    let sent = 0;
    for (const num of numbers) {
        try {
            const jid = num.includes('@') ? num : `${num}@s.whatsapp.net`;
            await sock.sendMessage(jid, { text: message });
            sent++;
        } catch (e) {
            console.error(`Failed sending to ${num}:`, e.message);
        }
    }
    res.json({ success: true, totalSent: sent });
});

app.post('/logout', async (req, res) => {
    try {
        if (sock) {
            sock.ev.removeAllListeners();
            sock.end();
            sock = null;
        }
    } catch (e) {
        console.error('Error closing socket:', e.message);
    }

    isConnected = false;
    isConnecting = false;
    qrCode = null;
    reconnectAttempts = 0;

    try {
        console.log('⚠️ Manual Logout. Clearing session...');
        if (fs.existsSync(AUTH_DIR)) {
            const files = fs.readdirSync(AUTH_DIR);
            for (const file of files) {
                fs.rmSync(`${AUTH_DIR}/${file}`, { recursive: true, force: true });
            }
        }
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─── Start ───────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n🚀 WhatsApp Bridge running on port ${PORT}`);
    console.log(`   Webhook: ${WEBHOOK_URL}`);
    console.log(`   Starting WhatsApp connection...\n`);
    connectToWhatsApp();
});
