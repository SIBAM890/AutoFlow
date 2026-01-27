const express = require('express');
const router = express.Router();
const workflowController = require('../controllers/workflow.controller');
const uploadController = require('../controllers/upload.controller');
const engineService = require('../services/engine.service');

// AI Routes
router.post('/generate-workflow', workflowController.createWorkflow);
router.post('/explain-workflow', workflowController.explainWorkflow);

// File Upload Route
router.post('/upload', uploadController.uploadFile);

// Simulation Route (Test Bridge)
router.post('/simulate-message', async (req, res) => {
    try {
        const { message } = req.body;
        // Mock WhatsApp socket
        let botReply = "No reply generated.";
        const mockSock = {
            sendMessage: async (jid, content) => {
                botReply = content.text;
                console.log("🤖 Simulated Reply:", botReply);
            }
        };

        // Run engine logic
        await engineService.processMessage(mockSock, "TestUser", message);

        res.json({ success: true, reply: botReply });
    } catch (error) {
        console.error("Simulation Error:", error);
        res.status(500).json({ error: "Simulation failed" });
    }
});

module.exports = router;