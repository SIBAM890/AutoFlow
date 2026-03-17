const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');

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

    // Ensure previous socket is dead before starting new one
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
            printQRInTerminal: true,
            logger: require('pino')({ level: 'silent' })
        });

        let isClosed = false;

        // Save credentials on update
        sock.ev.on('creds.update', async (creds) => {
            try {
                if (fs.existsSync(AUTH_DIR)) {
                    await saveCreds(creds);
                }
            } catch (e) {
                // Ignore save errors during cleanup
            }
        });

        // Connection update handler
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            // Capture QR Code
            if (qr) {
                console.log('📸 QR Code Generated!');
                qrCode = qr;
            }

            if (connection === 'close') {
                if (isClosed) return;
                isClosed = true;

                const statusCode = lastDisconnect?.error?.output?.statusCode;
                const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

                console.log(`❌ Connection closed. Status: ${statusCode}, Reconnect: ${shouldReconnect}`);

                isConnected = false;
                qrCode = null;
                sock?.ev?.removeAllListeners();

                if (!shouldReconnect) {
                    console.log('⚠️ Session Invalidated/Logged Out. Cleaning up...');
                    isConnecting = false;
                    try { sock?.end(); } catch (e) { }
                    sock = null;

                    try {
                        await new Promise(r => setTimeout(r, 500));
                        fs.rmSync(AUTH_DIR, { recursive: true, force: true });
                        console.log('📂 Session files deleted.');
                    } catch (e) {
                        console.error('Failed to delete session files:', e.message);
                    }
                } else {
                    console.log('🔄 Auto-reconnecting in 3s...');
                    isConnecting = false;
                    try { sock?.end(); } catch (e) { }
                    sock = null;

                    setTimeout(() => {
                        connectToWhatsApp();
                    }, 3000);
                }
            }

            if (connection === 'open') {
                console.log('✅ WhatsApp Connected Successfully!');
                isConnected = true;
                isConnecting = false;
                qrCode = null;
            }
        });

        // Message handler — forward to backend webhook
        sock.ev.on('messages.upsert', async ({ messages }) => {
            const msg = messages[0];
            if (!msg.message || msg.key.fromMe) return;

            const sender = msg.key.remoteJid;
            const userMessage =
                msg.message.conversation ||
                msg.message.extendedTextMessage?.text ||
                msg.message.imageMessage?.caption ||
                null;

            if (!userMessage) return;
            if (sender === 'status@broadcast') return;

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
        console.error('❌ WhatsApp Connection Failed:', e.message);
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
        phone: null
    });
});

app.get('/qr', (req, res) => {
    res.json({ qr: qrCode });
});

app.post('/deploy', async (req, res) => {
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
            sock.end(undefined);
            sock = null;
        }
    } catch (e) {
        console.error('Error closing socket:', e.message);
    }

    isConnected = false;
    isConnecting = false;
    qrCode = null;

    try {
        console.log('⚠️ Manual Logout. Clearing session...');
        fs.rmSync(AUTH_DIR, { recursive: true, force: true });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ─── Start Server & Connect ──────────────────────────────
app.listen(PORT, () => {
    console.log(`WhatsApp Bridge running on port ${PORT}`);
    // Auto-start WhatsApp connection
    connectToWhatsApp();
});
