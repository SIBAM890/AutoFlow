# AutoFlow OSS 🚀
> A fully open-source, local-first AI automation platform for Indian MSMEs.

![AutoFlow Logo](./frontend/public/vite.svg) (*Placeholder for Logo*)

## 🎯 The Problem
Small business owners (MSMEs) in India spend hours daily managing WhatsApp queries (inventory, pricing, generic questions) and tracking pending payments (udhaar) manually. Current SaaS automation tools are too complex to build, require cloud dependencies, monthly subscriptions, and expose private business data (like customer numbers and financial ledgers) to third-party endpoints.

## 💡 The Solution
**AutoFlow OSS** is a zero-cloud, 100% locally hosted automation engine. 
It uses an open-source, lightweight Large Language Model (Ollama running `qwen3:8b`) to allow non-technical shop owners to describe what they want in **Plain English**. 
>*"If a customer asks for stock on WhatsApp, check my inventory.csv and reply to them automatically."*

The AI converts this request into a structured visual workflow. The native Node.js WhatsApp bridge handles the messaging securely from the user's PC without needing API keys from Meta.

## ✨ Key Features
*   🗣️ **AI Workflow Generator**: Type plain English; the LLM builds the logic graph instantly.
*   🔒 **Privacy First (Zero Cloud)**: No API keys. No cloud storage. Your data never leaves your machine.
*   📦 **Direct Data Connectors**: Plugs natively into your existing local CSV files (e.g., `inventory.csv`, `udhaar.csv`).
*   🎨 **Visual Canvas**: A beautiful, drag-and-drop ReactFlow builder to tweak the AI's logic graphically.
*   🔌 **Native WhatsApp Bridge**: Uses `whatsapp-web.js` via local headless Chromium—no Meta API setup required.

---

## 🏗️ System Architecture

AutoFlow is architected as a set of Dockerized microservices that run seamlessly on standard laptops:

```mermaid
graph TD
    User([Business Owner]) -->|NL Prompt| F(Frontend UI: React + Vite)
    F -->|POST /api/workflow/generate| B(Backend API: FastAPI)
    
    subgraph Local Environment (Docker)
        F
        B
        O[(Ollama Qwen 2.5/3 8b)]
        DB[(SQLite)]
        W(WhatsApp Bridge: Node.js)
        CSV[Local CSV Files]
    end

    B -->|Generate JSON| O
    B -->|Store Workflow| DB
    B -->|Read/Write| CSV
    
    C([Customer on WhatsApp]) <-->|Messages| W
    W -->|Webhook /api/whatsapp/incoming| B
    B -->|Execute Action Commands| W
```

### Tech Stack
| Component | Technology | Description |
|-----------|------------|-------------|
| **AI LLM Engine** | Ollama | Native AI host running Qwen 2.5/3 (8b) local model |
| **Backend Core** | FastAPI (Python) | High-performance async routing, handles the Execution DAG |
| **Database** | SQLite + SQLModel | Serverless local storage mapped to `./data/` |
| **Frontend UI** | React + Vite + Zustand | Fast configuration panel with rich ReactFlow visualization |
| **Messaging** | Node.js + WWebJS | Local chromium session bridging real WhatsApp |

---

## 🏃 Quick Start Guide

Ensure you have **Docker** and **Docker-Compose** installed on your system.
*(Note: The first run must download the 4.7GB Ollama Model. Subsequent runs are instant.)*

```bash
git clone https://github.com/nexis-team/autoflow-oss.git
cd autoflow-oss

# Spin up all 4 microservices
docker-compose up --build
```

### Accessing the Services:
- **Frontend Builder**: [http://localhost:3000](http://localhost:3000)
- **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **WhatsApp Bridge Status**: [http://localhost:3001/status](http://localhost:3001/status)

### Linking WhatsApp:
1. Check the Docker terminal output for the `whatsapp-bridge` container.
2. It will print a large QR code.
3. Open WhatsApp on your phone -> Linked Devices -> Link a Device.
4. Scan the terminal QR code. The bridge will emit `Client is ready!`.

---

## 🧪 Demo Workflows

The SQLite database drops with pre-seeded templates to demonstrate the FOSS Hack goals:
1. **Stock Query Auto-Reply**: Reads `data/inventory.csv` to answer product stock queries dynamically.
2. **Udhaar Payment Reminder**: Evaluates `data/udhaar.csv` for days overdue > 7, and blasts targeted WhatsApp reminders.
3. **Customer Broadcast**: Loads a list of numbers from `data/customers.csv` and sends bulk announcements.

---

## 👨‍💻 Team
Built with ❤️ by **Team Nexis** for the **FOSS Hack 2026**.
*Sri Sri University FET*

## 📜 License
This project is licensed under the [MIT License](LICENSE).
