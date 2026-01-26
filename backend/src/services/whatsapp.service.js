const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const engineService = require('./engine.service');

exports.connectToWhatsApp = async () => {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    const sock = makeWASocket({
        auth: state,
        logger: require('pino')({ level: 'silent' })
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log("▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄");
            console.log("█ SCAN THIS QR WITH WHATSAPP █");
            console.log("▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀");
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('❌ Connection closed. Reconnecting...', shouldReconnect);
            if (shouldReconnect) {
                exports.connectToWhatsApp();
            }
        } else if (connection === 'open') {
            console.log('✅ WhatsApp Connected Successfully!');
        }
    });

    // Listen for Messages
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];

        // Ignore messages sent by yourself
        if (!msg.key.fromMe && msg.message) {

            // 1. EXTRACT TEXT SAFELY (The Fix)
            const userMessage =
                msg.message.conversation ||
                msg.message.extendedTextMessage?.text ||
                msg.message.imageMessage?.caption ||
                null;

            const sender = msg.key.remoteJid;

            // 2. IGNORE EMPTY MESSAGES (Status updates, stickers, etc.)
            if (!userMessage) {
                // console.log(`📩 Ignored non-text message from ${sender}`);
                return;
            }

            console.log(`📩 New Message from ${sender}: ${userMessage}`);

            // 3. SEND TO ENGINE
            try {
                await engineService.processMessage(sock, sender, userMessage);
            } catch (error) {
                console.error("❌ Engine Error:", error);
            }
        }
    });
};