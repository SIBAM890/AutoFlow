# ⚡ AutoFlow AI

**The Intelligent AI Agent Builder for Everyone.**

AutoFlow AI is a powerful, low-code platform that allows you to build, visualize, and deploy AI automation agents effortlessly. It combines a state-of-the-art **React-based Visual Builder** with a robust **Node.js + Google Gemini AI Backend**.

![AutoFlow Builder Screenshot](https://via.placeholder.com/800x450.png?text=AutoFlow+Builder+Preview)

## 🚀 Key Features

- **🧠 Google Gemini Pro Integration**: Powered by the latest Gemini 1.5 Flash models for lightning-fast and cost-effective AI reasoning.
- **🎨 Professional Visual Builder**: 
  - **Dark Mode** infinite canvas.
  - **Agent-Centric Topology**: All workflows centralized around your "AutoFlow Agent".
  - **Dynamic Bezier Curves**: Smooth, professional connection lines.
- **🔌 100+ Integration Tools**: Pre-built nodes for WhatsApp, Gmail, Slack, Salesforce, Stripe, and more.
- **🛠️ Customization Mode**: Toggle between simple AI generation and advanced "Tech Mode" for manual fine-tuning.
- **💬 Natural Language to Workflow**: Just type "Create a WhatsApp bot for order tracking" and watch the AI build it for you.

---

## 🏗️ Project Structure

This is a monorepo containing both the frontend and backend:

\`\`\`
AutoFlow/
├── backend/            # Node.js Express Server + Gemini AI Logic
│   ├── src/           
│   ├── server.js       
│   └── .env (Required)
│
└── autoflow-frontend/  # React + Vite + Tailwind Builder
    ├── src/
    └── package.json
\`\`\`

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- Google AI Studio API Key (Free Tier supported)

### 1. Backend Setup

\`\`\`bash
cd backend
npm install
\`\`\`

Create a `.env` file in the `backend` folder:
\`\`\`env
GEMINI_API_KEY=your_google_ai_studio_key_here
PORT=3000
\`\`\`

Start the server:
\`\`\`bash
node server.js
\`\`\`
*> Server runs on http://localhost:3000*

### 2. Frontend Setup

Open a new terminal:
\`\`\`bash
cd autoflow-frontend
npm install
npm run dev
\`\`\`
*> Builder runs on http://localhost:5173*

---

## 🎮 Usage Guide

1.  Open the **Builder** in your browser.
2.  **Chat with AI**: Type a prompt like *"Build a customer support agent that handles refunds via email"*.
3.  **Visualize**: The AI will instantly generate a star-topology workflow centered around your **AutoFlow Agent**.
4.  **Customize**:
    - Click **"Customization Mode"** (top right) to open the toolbox.
    - Drag & Drop extra tools (Slack, Sheets, etc.) from the library of 100+ plugins.
    - Connect them to the **Agent Node's** special bottom ports.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---
*Built with ❤️ by [SIBAM890](https://github.com/SIBAM890)*
