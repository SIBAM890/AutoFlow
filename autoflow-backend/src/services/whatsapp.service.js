const fs = require("fs");
const makeWASocket = require("@whiskeysockets/baileys").default;
const {
    useMultiFileAuthState,
    DisconnectReason,
} = require("@whiskeysockets/baileys");
const engineService = require("./engine.service"); // UPDATE PATH IF NEEDED

exports.connectToWhatsApp = async () => {
    try {
        const { state, saveCreds } = await useMultiFileAuthState(
            "auth_info_baileys"
        );

        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: true,
            logger: require('pino')({ level: 'fatal' }) // Suppress jargon logs
        });

        // Save credentials
        sock.ev.on("creds.update", saveCreds);

        // ❤️ FIXED — connection + lastDisconnect now exist
        sock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect } = update;

            if (connection === "close") {
                const shouldReconnect =
                    lastDisconnect?.error?.output?.statusCode !==
                    DisconnectReason.loggedOut;

                console.log("❌ Connection closed. Reconnecting...", shouldReconnect);

                if (!shouldReconnect) {
                    console.log(
                        "⚠️ Logged out. Clearing session to generate new QR..."
                    );

                    try {
                        fs.rmSync("auth_info_baileys", { recursive: true, force: true });
                    } catch (e) {
                        console.error("Failed to delete session:", e.message);
                    }
                }

                // restart
                return exports.connectToWhatsApp();
            }

            if (connection === "open") {
                console.log("✅ WhatsApp Connected Successfully!");
            }
        });

        // ❤️ FIXED — sock exists properly here
        sock.ev.on("messages.upsert", async ({ messages }) => {
            const msg = messages[0];
            if (!msg.message || msg.key.fromMe) return;

            const sender = msg.key.remoteJid;

            const userMessage =
                msg.message.conversation ||
                msg.message.extendedTextMessage?.text ||
                msg.message.imageMessage?.caption ||
                null;

            if (!userMessage) return;

            console.log(`📩 New Message from ${sender}: ${userMessage}`);

            try {
                await engineService.processMessage(sock, sender, userMessage);
            } catch (err) {
                console.error("❌ Engine Error:", err);
            }
        });
    } catch (e) {
        console.error("❌ WhatsApp Connection Failed:", e);
    }
};
