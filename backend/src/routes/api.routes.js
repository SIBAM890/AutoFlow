const express = require('express');
const router = express.Router();
const workflowController = require('../controllers/workflow.controller');
const engineService = require('../services/engine.service'); // Import Engine

// AI Routes
router.post('/generate-workflow', workflowController.createWorkflow);
router.post('/explain-workflow', workflowController.explainWorkflow);

// ✅ SIMULATION ROUTE (The Test Bridge)
router.post('/simulate-message', async (req, res) => {
    const { message } = req.body;
    let botReply = "";

    // MOCK SOCKET: Pretends to be WhatsApp
    const mockSock = {
        sendMessage: async (sender, content) => {
            botReply = content.text; // Capture the reply
        }
    };

    // Run the real engine logic
    await engineService.processMessage(mockSock, "TestUser", message);

    // Send the captured reply back to Frontend
    res.json({ success: true, reply: botReply });
});

module.exports = router;