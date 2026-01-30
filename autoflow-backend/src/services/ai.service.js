const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Validate workflow structure
 */
function validateWorkflow(parsed) {
  // Support both wrappers
  const nodes = parsed.nodes || parsed.steps || parsed.workflow?.nodes;

  if (!nodes || !Array.isArray(nodes)) {
    throw new Error("Invalid structure: Missing 'nodes' or 'steps' array");
  }

  return nodes;
}

/**
 * Generate fallback workflow when AI fails
 */
function generateFallbackWorkflow(reason = "System Busy") {
  return {
    nodes: [
      {
        id: "1",
        type: "trigger",
        position: { x: 100, y: 100 },
        data: {
          label: "Message Received",
          triggerType: "whatsapp_message",
          config: { platform: "whatsapp" }
        }
      },
      {
        id: "2",
        type: "action",
        position: { x: 400, y: 100 },
        data: {
          label: "Automated Reply",
          actionType: "send_whatsapp",
          config: {
            recipient: "{{trigger.from}}",
            message: `Service Temporarily unavailable. Reason: ${reason}`
          }
        }
      }
    ]
  };
}

const googleSheetService = require('./googleSheet.service');

exports.generateWorkflow = async (userPrompt, fileContext = "") => {
  console.log("🤖 AI Service: Generating workflow for:", userPrompt);

  // 1. Try to fetch Real Inventory from Google Sheets
  let inventoryData = null;
  try {
    inventoryData = await googleSheetService.syncInventory();
    console.log(`📊 Loaded ${inventoryData.length} items from Google Sheets`);
  } catch (e) {
    console.warn("⚠️ Failed to load Google Sheet inventory, falling back to file context or empty.");
  }

  // 2. Fallback to file context if Sheet is empty/failed
  if (!inventoryData || inventoryData.length === 0) {
    inventoryData = fileContext?.preview || fileContext?.data || null;
  }

  const inventoryColumns = inventoryData && inventoryData.length > 0 ? Object.keys(inventoryData[0]) : [];


  // Sample data for AI context
  const sampleData = inventoryData ? inventoryData.slice(0, 3) : [];

  if (fileContext) {
    console.log("📂 With File Context:", inventoryColumns.join(', '));
  }

  // ⚡ USE FLASH MODEL FOR SPEED (As requested)
  // Fallback to pro if flash fails
  const modelsToTry = ["gemini-flash-latest", "gemini-1.5-flash", "gemini-pro"];

  for (const modelName of modelsToTry) {
    try {
      console.log(`🔄 Attempting Model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = `
      Act as an Automation Architect. 
      Generate a JSON workflow for: "${userPrompt}"
      
      CONTEXT:
      ${sampleData.length > 0 ? `
      - INVENTORY COLUMNS: ${inventoryColumns.join(', ')}
      - SAMPLE DATA: ${JSON.stringify(sampleData)}
      (Use 'condition' nodes to check Stock/Price if relevant)
      ` : ''}
      
      RULES:
      1. Create a LOGICAL FLOW (Step 1 -> Step 2 -> Step 3).
      2. Every node MUST detect its target using:
         - "next": ["target_id"] (For standard actions)
         - "true_id": "target_id", "false_id": "target_id" (For conditions)
         - "outputs": { "intent": "target_id" } (For AI Agents)
      3. Do NOT connect everything to the Start node. Chain them!
      
      STRICT OUTPUT format (JSON ONLY):
      {
        "nodes": [
           { 
             "id": "1", 
             "type": "trigger", 
             "data": { "label": "Start" },
             "next": ["2"] 
           },
           {
             "id": "2",
             "type": "ai_agent", 
             "data": { "label": "Detect Intent", "outputs": { "price": "3", "stock": "4" } }
           },
           {
             "id": "3", 
             "type": "action", 
             "data": { "label": "Check Price" },
             "next": ["5"]
           }
           // ... more nodes
        ]
      }
      
      Generate now.
      `.trim();

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log(`✅ ${modelName} Success. Length:`, text.length);

      // Clean JSON
      const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanJson);

      const nodes = validateWorkflow(parsed);

      return { nodes };

    } catch (error) {
      console.warn(`⚠️ ${modelName} Failed:`, error.message);
      if (modelName === modelsToTry[modelsToTry.length - 1]) {
        console.error("❌ All models failed.");
        return generateFallbackWorkflow();
      }
    }
  }
};

exports.explainWorkflow = async (workflowJson) => {
  // ⚡ Simple Text Explanation (Prevents Frontend Crash)
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const prompt = `
      Analyze this workflow and explain it in simple terms.
      
      Workflow: ${JSON.stringify(workflowJson).substring(0, 2000)}
      
      RULES:
      1. Output PLAIN TEXT only. Do NOT output a JSON object.
      2. Use a professional, technical tone. Use bullet points.
      3. Do NOT use emojis.
      4. Keep it brief (max 3-4 lines).
      `.trim();

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    // Double cleaning just in case
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").replace(/^{"explanation":/g, "").replace(/}$/g, "").trim();

    return { explanation: cleanText };
  } catch (e) {
    return { explanation: "AI could not generate explanation." };
  }
};