const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.generateWorkflow = async (userPrompt) => {
  console.log("🤖 AI Service: Generating workflow for:", userPrompt);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
        You are an automation builder.
        The user describes a workflow.

        Your job: ALWAYS output VALID JSON ONLY.

        Format:
        {
          "trigger": "whatsapp_message",
          "steps": [
            { "id": "1", "type": "trigger", "data": { "label": "Message Received" }, "position": { "x": 250, "y": 0 } },
            { "id": "2", "type": "action", "data": { "label": "Analyze Intent" }, "position": { "x": 250, "y": 100 } },
            { "id": "3", "type": "condition", "data": { "label": "Is Product Inquiry?" }, "position": { "x": 250, "y": 200 } },
            { "id": "4", "type": "action", "data": { "label": "Reply with Price" }, "position": { "x": 250, "y": 300 } }
          ]
        }

        If the user text is unclear, still guess the most likely workflow.
        NEVER output text outside JSON.
        User said: "${userPrompt}"
        `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("🤖 AI Raw Response:", text);

    // Clean up markdown code blocks if Gemini adds them
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();

    try {
      const parsed = JSON.parse(cleanJson);
      // Ensure "steps" exists for React Flow
      if (!parsed.steps) {
        parsed.steps = [];
      }
      return parsed;
    } catch (parseError) {
      console.error("❌ JSON Parse Failed. Raw text:", cleanJson);
      throw new Error("AI returned invalid JSON");
    }

  } catch (error) {
    console.error("❌ AI Service Error:", error);
    // Fallback workflow so UI doesn't break
    return {
      trigger: "whatsapp_message",
      steps: [
        { id: "1", type: "trigger", data: { label: "Message Received" }, position: { x: 250, y: 0 } },
        { id: "2", type: "action", data: { label: "AI Error - Default Flow" }, position: { x: 250, y: 100 } }
      ]
    };
  }
};

exports.explainWorkflow = async (workflowJson) => {
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
  const prompt = `Explain this workflow in simple, human language with emojis:\n${JSON.stringify(workflowJson)}`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};