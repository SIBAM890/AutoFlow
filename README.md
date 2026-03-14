# AutoFlow OSS 🚀

> A local-first, AI-powered automation engine built for Indian MSMEs. 

**Problem**: Small business owners spend hours managing WhatsApp queries, stock checks, and udhaar reminders manually, but SaaS automation tools are too complex, cloud-dependent, and expensive.
**Solution**: AutoFlow runs entirely on the local machine. It uses a lightweight, open-source AI (Ollama `qwen3:8b`) to let shop owners write plain-English rules ("If customer asks for stock, check my CSV and reply"), converting them into a visual workflow graph that directly controls WhatsApp securely from the local desktop.

## ✨ Features
*   🗣️ **Natural Language Builder**: Type "Remind my udhaar list", AI builds the logic.
*   🔒 **100% Local**: Zero API keys. Zero Cloud storage. Your data (and WhatsApp sessions) stay native.
*   📦 **CSV/Sheet Connectors**: Plugs directly into your existing `inventory.csv` or local files without fancy APIs.
*   🤖 **Ollama Powered**: Runs `qwen3:8b` locally to parse instructions and execute decisions.
*   🎨 **Visual Canvas**: Drag-and-drop ReactFlow builder to tweak the AI's logic graphically.

## 🛠️ Tech Stack
| Tier | Tech | Description |
|---|---|---|
| **AI LLM Engine** | Ollama | Native AI host running Qwen 2.5/3 (8b) |
| **Backend API** | FastAPI (Python) | High-performance async routing, handles the Execution DAG |
| **Database** | SQLite + SQLModel | Serverless local storage mapped to `./data/` volumes |
| **Frontend UI** | React + Vite + Zustand | Fast configuration panel with rich ReactFlow visualization |
| **Messaging Bridge** | Node.js + WWebJS | Headless local chromium session for bridging real WhatsApp |

---

## 🏃 Quick Start (Docker)

Ensure you have Docker and Docker-Compose installed. *Warning: The first run must download the 4.7GB Ollama Model.*

```bash
git clone https://github.com/your-username/autoflow-oss.git
cd autoflow-oss

# Spin up all 4 microservices
docker-compose up --build
```

**Services will map to:**
- Frontend Builder: `http://localhost:3000`
- Backend API Docs: `http://localhost:8000/docs`
- WhatsApp Bridge: `http://localhost:3001/status`

Scan the WhatsApp QR code printed in the backend terminal to link your business number. 

---
**Team Nexis** 
*Sri Sri University FET — FOSS Hack 2026 Submission*
License: MIT
