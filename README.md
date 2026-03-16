<p align="center">
  <img src="https://img.shields.io/badge/AutoFlow-OSS-blueviolet?style=for-the-badge&logo=zap&logoColor=white" alt="AutoFlow OSS"/>
</p>

<h1 align="center">⚡ AutoFlow OSS</h1>

<p align="center">
  <strong>AI-Powered WhatsApp Automation for Indian SMBs</strong><br/>
  Describe your automation in plain English → Get a visual workflow → Deploy as a live WhatsApp agent
</p>

<p align="center">
  <img src="https://img.shields.io/badge/python-3.11-blue?logo=python&logoColor=white" alt="Python"/>
  <img src="https://img.shields.io/badge/react-18-61DAFB?logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/docker-compose-2496ED?logo=docker&logoColor=white" alt="Docker"/>
  <img src="https://img.shields.io/badge/ollama-local_LLM-000000?logo=ollama&logoColor=white" alt="Ollama"/>
  <img src="https://img.shields.io/badge/whatsapp-bridge-25D366?logo=whatsapp&logoColor=white" alt="WhatsApp"/>
  <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT"/>
</p>

---

## 🎯 What Is AutoFlow?

**AutoFlow** is an open-source, self-hosted WhatsApp automation platform built for small and medium businesses in India. It allows non-technical shop owners — from kirana stores to clothing boutiques — to create powerful business automations using **natural language**.

Instead of writing code, you describe what you want:

> *"When a customer asks about stock, check my inventory CSV and reply with the quantity."*

AutoFlow uses a **local LLM (via Ollama)** to convert this into a visual workflow graph, which can be activated to run as a live WhatsApp agent — all running on your own machine. **No cloud APIs, no subscriptions, no data leaving your system.**

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🧠 **Natural Language → Workflow** | Describe automations in plain English; AI generates a complete node graph |
| 🔀 **Visual Workflow Builder** | Drag-and-drop React Flow canvas with custom nodes (Trigger, Action, Condition, WhatsApp, Inventory, Delay) |
| 📱 **WhatsApp Integration** | Real WhatsApp bridge via `whatsapp-web.js` with QR code authentication |
| 📦 **Inventory Management** | Upload CSV files with product/stock data; auto-reply to customer queries |
| 🤖 **Workflow Executor** | Graph-traversal engine that evaluates conditions, fires actions, sends messages |
| 📊 **Analytics Dashboard** | Track agent runs, query volumes, and resolution rates with Recharts |
| 🔍 **Audit Logging** | Every workflow execution is logged with full context for debugging |
| 🧩 **Template Marketplace** | Pre-built automation templates (Stock Query, Payment Reminder, Broadcast) |
| 🚀 **One-Click Deploy** | Deploy your agent with QR scan — see live logs in real-time |
| 🔒 **Fully Self-Hosted** | No cloud dependency. Your data stays on your machine. |

---

## 🏗️ Architecture Overview

AutoFlow follows a **microservice architecture** with 4 Docker containers:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Docker Compose Network                       │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  ┌────────┐ │
│  │   Frontend    │  │   Backend    │  │   WhatsApp    │  │ Ollama │ │
│  │  React + Vite │  │   FastAPI    │  │    Bridge     │  │  LLM   │ │
│  │  :3000        │→ │  :8000       │→ │  Node.js      │  │ :11434 │ │
│  │              │  │              │  │  :3001         │  │        │ │
│  └──────────────┘  └──────┬───────┘  └───────────────┘  └────────┘ │
│                           │                                         │
│                    ┌──────┴──────┐                                   │
│                    │   SQLite    │                                   │
│                    │  autoflow.db│                                   │
│                    └─────────────┘                                   │
└─────────────────────────────────────────────────────────────────────┘
```

| Service | Technology | Port | Purpose |
|---------|-----------|------|---------|
| **Frontend** | React 18 + Vite + TailwindCSS + React Flow | `3000` | Visual workflow builder, dashboard, deploy page |
| **Backend** | FastAPI + SQLModel + SQLite | `8000` | REST API, workflow CRUD, AI generation, executor engine |
| **WhatsApp Bridge** | Node.js + Express + whatsapp-web.js | `3001` | Manages WhatsApp sessions, sends/receives messages |
| **Ollama** | Ollama + Qwen3:8B | `11434` | Local LLM for NL→Workflow generation and explanations |

> 📄 For detailed architecture, see [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md)

---

## 📂 Project Structure

```
AutoFlow/
├── frontend/                          # React SPA (Vite)
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js              # Axios API client (workflow, templates, audit, inventory, whatsapp)
│   │   ├── components/
│   │   │   ├── builder/
│   │   │   │   └── NodePalette.jsx    # Drag-and-drop node sidebar
│   │   │   ├── dashboard/
│   │   │   │   └── ROIDashboard.jsx   # Performance metrics + Recharts analytics
│   │   │   ├── landing/               # Landing page components
│   │   │   ├── layout/
│   │   │   │   └── TopBar.jsx         # Top navigation with Save/Activate buttons
│   │   │   ├── nodes/                 # Custom React Flow node components
│   │   │   │   ├── TriggerNode.jsx    # 🟢 Green — WhatsApp trigger entry point
│   │   │   │   ├── ActionNode.jsx     # 🔵 Blue — Execute business logic
│   │   │   │   ├── ConditionNode.jsx  # 🟠 Amber — Diamond shape, true/false branches
│   │   │   │   ├── WhatsAppNode.jsx   # 🟩 Emerald — Send WhatsApp messages
│   │   │   │   ├── InventoryNode.jsx  # 🟧 Orange — CSV inventory lookup
│   │   │   │   └── DelayNode.jsx      # 🟣 Purple — Time-based delays
│   │   │   ├── panels/
│   │   │   │   ├── NLInputPanel.jsx   # Natural language input bar (bottom)
│   │   │   │   ├── NodeConfigPanel.jsx# Side panel for editing node properties
│   │   │   │   └── AIExplainerPanel.jsx# AI-generated workflow explanation
│   │   │   ├── simulation/            # Workflow simulation components
│   │   │   ├── ui/                    # Shared UI primitives
│   │   │   └── visualization/
│   │   │       ├── WorkflowGraph.jsx  # Main React Flow canvas
│   │   │       └── CustomNode.jsx     # Base custom node renderer
│   │   ├── store/
│   │   │   └── workflowStore.js       # Zustand state management
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx        # Welcome / hero page
│   │   │   ├── Dashboard.jsx          # Industry selector + metrics + active workflows
│   │   │   ├── Builder.jsx            # Visual workflow editor (main page)
│   │   │   ├── Templates.jsx          # Pre-built template marketplace
│   │   │   ├── DeployPage.jsx         # WhatsApp QR connect + live deploy
│   │   │   └── NotFound.jsx           # 404 page
│   │   ├── App.jsx                    # React Router setup
│   │   └── main.jsx                   # App entry point
│   ├── Dockerfile
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/                           # Python FastAPI backend
│   ├── main.py                        # FastAPI app, CORS, routes, webhook listener
│   ├── database.py                    # SQLite/SQLModel engine + session
│   ├── models.py                      # ORM models (Workflow, Template, AuditLog, InventorySource)
│   ├── schemas.py                     # Pydantic request/response schemas
│   ├── ollama_client.py               # LLM integration (generate + explain workflows)
│   ├── executor.py                    # Workflow graph executor engine
│   ├── seeder.py                      # Database seeding (templates + demo workflows)
│   ├── routers/
│   │   ├── inventory.py               # CSV upload + product search API
│   │   ├── templates.py               # Template CRUD + fork API
│   │   └── audit.py                   # Audit log query API
│   ├── Dockerfile
│   └── requirements.txt
│
├── whatsapp-bridge/                   # Node.js WhatsApp connector
│   ├── server.js                      # Express server, whatsapp-web.js client, REST API
│   ├── Dockerfile
│   └── package.json
│
├── data/                              # Persistent data directory (SQLite + CSVs)
├── docker-compose.yml                 # Full stack orchestration
├── SYSTEM_ARCHITECTURE.md             # Detailed system design document
├── WORKFLOW.md                        # Workflow format specification
├── TEST_CHECKLIST.md                  # QA checklist
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version | Purpose |
|---|---|---|
| **Docker Desktop** | Latest | Container runtime |
| **Docker Compose** | v2+ | Multi-container orchestration |
| **Git** | Any | Clone the repository |
| **8GB+ RAM** | Minimum | Required for Ollama LLM inference |

> ⚠️ **No GPU required** — Ollama runs on CPU. However, a GPU will significantly speed up workflow generation.

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/SIBAM890/AutoFlow.git
cd AutoFlow

# 2. Start all services (first run will download the Qwen3:8B model ~5GB)
docker-compose up --build

# 3. Wait for all 4 services to become healthy (~2-5 minutes on first run)
# You'll see: "Uvicorn running on http://0.0.0.0:8000"
# And: "VITE ready in XXX ms"
```

### Access the Application

| Service | URL | Description |
|---------|-----|-------------|
| **Landing Page** | [http://localhost:3000](http://localhost:3000) | Welcome page with CTA |
| **Dashboard** | [http://localhost:3000/dashboard](http://localhost:3000/dashboard) | Analytics + industry selector |
| **Builder** | [http://localhost:3000/builder](http://localhost:3000/builder) | Visual workflow editor |
| **Templates** | [http://localhost:3000/templates](http://localhost:3000/templates) | Pre-built automation templates |
| **Deploy Agent** | [http://localhost:3000/deploy-agent](http://localhost:3000/deploy-agent) | Connect WhatsApp via QR |
| **API Docs** | [http://localhost:8000/docs](http://localhost:8000/docs) | FastAPI Swagger UI |

---

## 📖 Usage Guide

### 1. Create a Workflow (AI-Powered)

1. Navigate to the **Builder** page
2. In the bottom input bar, type your automation in plain English:
   > *"When someone asks about sugar stock on WhatsApp, check my inventory and reply with the quantity"*
3. Click **Generate Built** ✨
4. The AI creates a visual workflow with connected nodes
5. Click on any node to edit its configuration
6. Click **Save** to persist the workflow

### 2. Use a Template

1. Go to the **Templates** page
2. Browse pre-built automations:
   - **Stock Query Auto-Reply** — Auto-responds to product availability questions
   - **Payment Reminder** — Sends payment reminders to customers with overdue balances
   - **Customer Broadcast** — Mass message your customer list
3. Click **Use Template** to fork it into your builder

### 3. Upload Inventory Data

The inventory system uses CSV files. Create a file at `data/inventory.csv`:

```csv
product,quantity,price
Sugar,50,45.00
Rice,100,65.00
Atta,30,280.00
Oil,25,150.00
```

Or use the **Inventory Upload API**:
```bash
curl -X POST http://localhost:8000/api/inventory/upload \
  -F "file=@inventory.csv"
```

### 4. Deploy Your WhatsApp Agent

1. **Activate** your workflow in the Builder (click the green Activate button)
2. Navigate to **Deploy Agent**
3. Scan the QR code with your WhatsApp mobile app
4. Your agent is now **live** — it will auto-respond to matching messages!

### 5. Test the Agent

Send a WhatsApp message to the connected number:
> *"Do you have sugar in stock?"*

The agent will:
1. Match the keyword `sugar` from the trigger node
2. Look up `sugar` in your `inventory.csv`
3. Reply: *"Yes! Sugar is available. Stock: 50 units."*

---

## 🔌 API Reference

### Workflow APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/workflow/generate` | Generate workflow from natural language |
| `POST` | `/api/workflow/save` | Save a workflow |
| `GET` | `/api/workflow/list` | List all workflows |
| `GET` | `/api/workflow/{id}` | Get workflow by ID |
| `POST` | `/api/workflow/{id}/activate` | Activate a workflow |
| `POST` | `/api/workflow/{id}/deactivate` | Deactivate a workflow |
| `POST` | `/api/workflow/{id}/execute` | Manually trigger a workflow |

### Template APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/templates` | List all templates |
| `GET` | `/api/templates/{id}` | Get template by ID |
| `POST` | `/api/templates/{id}/fork` | Fork a template into a workflow |

### Inventory APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/inventory/upload` | Upload CSV inventory file |
| `GET` | `/api/inventory/list` | List all inventory sources |
| `GET` | `/api/inventory/{id}/data` | Get inventory data as JSON |

### Audit APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/audit` | List all audit logs |
| `GET` | `/api/audit/{workflow_id}` | Get audit logs for a specific workflow |

### WhatsApp Bridge APIs (Internal)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/status` | Connection status + QR code |
| `GET` | `/qr` | Get current QR code |
| `POST` | `/send` | Send a message `{ to, message }` |
| `POST` | `/broadcast` | Broadcast `{ numbers[], message }` |

---

## 🧠 AI / LLM Integration

AutoFlow uses **Ollama** with the **Qwen3:8B** model for two core features:

### Workflow Generation (`/api/workflow/generate`)
- Takes a natural language prompt
- Sends it to Ollama with a structured system prompt defining available node types
- Parses the LLM's JSON response into validated workflow nodes and edges
- **Error handling**: If JSON parsing fails, retries with a stricter prompt
- **Retry logic**: 3 attempts with 2-second delays if Ollama isn't ready

### Workflow Explanation (`/api/workflow/explain`)
- Takes a workflow JSON object
- Generates a plain-English explanation aimed at non-technical users
- Displayed in the AI Explainer Panel in the builder

### Supported Node Types

| Type | Action Types | Description |
|------|-------------|-------------|
| `trigger` | `whatsapp_message`, `schedule`, `manual` | Entry point for workflows |
| `action` | `inventory_lookup`, `send_whatsapp`, `send_broadcast`, `log_payment`, `load_udhaar_list`, `load_customers` | Business logic execution |
| `condition` | `compare`, `contains_text`, `time_check` | Branching based on data evaluation |
| `whatsapp` | Send outbound message | Template-variable aware messaging |
| `delay` | `wait_seconds`, `wait_until` | Time-based pauses |

---

## ⚙️ Workflow Executor Engine

The `WorkflowExecutor` class (`backend/executor.py`) is the runtime engine that processes workflows:

```
Trigger Node → Action Node → Condition Node → True Branch (WhatsApp)
                                             → False Branch (WhatsApp)
```

### How It Works

1. **Trigger Match** — When a WhatsApp message arrives, the webhook checks all active workflows for keyword matches
2. **Graph Traversal** — Starting from the trigger node, the executor walks the edge graph
3. **Action Execution** — Each action node runs its configured operation (CSV lookup, WhatsApp send, etc.)
4. **Condition Evaluation** — Condition nodes evaluate data from the context and follow the matching branch
5. **Template Variables** — `{{trigger.from}}`, `{{results.node_id.quantity}}` are resolved dynamically
6. **Audit Logging** — Every execution is logged to `audit_logs` table regardless of success/failure

### Context Object

```python
context = {
    "trigger": {
        "from": "919876543210@c.us",
        "message": "do you have sugar?",
        "raw": { ... }
    },
    "results": {
        "inventory_1": {
            "found": True,
            "product": "Sugar",
            "quantity": 50,
            "price": 45.00
        }
    }
}
```

---

## 🗄️ Database Schema

AutoFlow uses **SQLite** via SQLModel (SQLAlchemy). Four tables:

### `workflows`
| Column | Type | Description |
|--------|------|-------------|
| `id` | `TEXT PK` | UUID |
| `name` | `TEXT` | Workflow name |
| `description` | `TEXT` | Optional description |
| `nl_input` | `TEXT` | Original natural language prompt |
| `nodes` | `JSON` | Array of React Flow nodes |
| `edges` | `JSON` | Array of React Flow edges |
| `is_active` | `BOOL` | Whether workflow responds to triggers |
| `created_at` | `DATETIME` | Creation timestamp |
| `updated_at` | `DATETIME` | Last update timestamp |

### `templates`
| Column | Type | Description |
|--------|------|-------------|
| `id` | `TEXT PK` | UUID |
| `name` | `TEXT` | Template name |
| `category` | `TEXT` | Category (`inventory`, `payments`, `broadcast`, `orders`) |
| `nodes` / `edges` | `JSON` | Pre-built workflow structure |
| `use_count` | `INT` | Number of times template has been forked |

### `audit_logs`
| Column | Type | Description |
|--------|------|-------------|
| `id` | `TEXT PK` | UUID |
| `workflow_id` | `TEXT FK` | Reference to workflows table |
| `trigger_type` | `TEXT` | `whatsapp`, `schedule`, `manual` |
| `trigger_data` | `JSON` | Incoming message data |
| `actions_taken` | `JSON` | Array of executed node details |
| `result` | `TEXT` | `success`, `failed`, `skipped` |
| `error_message` | `TEXT` | Error details if failed |

### `inventory_sources`
| Column | Type | Description |
|--------|------|-------------|
| `id` | `TEXT PK` | UUID |
| `name` | `TEXT` | Source name |
| `type` | `TEXT` | `csv` or `google_sheets` |
| `file_path` | `TEXT` | Path to uploaded CSV |

---

## 🛠️ Development

### Running Without Docker

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**WhatsApp Bridge:**
```bash
cd whatsapp-bridge
npm install
node server.js
```

**Ollama:**
```bash
ollama serve
ollama pull qwen3:8b
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OLLAMA_URL` | `http://ollama:11434` | Ollama API endpoint |
| `WHATSAPP_BRIDGE_URL` | `http://whatsapp-bridge:3001` | WhatsApp bridge endpoint |
| `DATABASE_URL` | `sqlite:///./autoflow.db` | SQLite database path |

### Hot Reload (Docker)

Both frontend and backend support live code reloading via Docker volume mounts:
- **Frontend**: Source files in `./frontend` are mounted to `/app` in the container. Vite watches for changes.
- **Backend**: Source files in `./backend` are mounted to `/app`. Uvicorn runs with `--reload`.

---

## 🧪 Demo Workflows

AutoFlow seeds two demo workflows on first launch:

### Demo 1: Stock Query Auto-Reply
```
WhatsApp Trigger → Inventory Lookup → Condition (qty > 0?)
                                       ├── True → Reply "Sugar available, 50 units"
                                       └── False → Reply "Sugar out of stock"
```
**Keywords**: `stock`, `available`, `have you got`, `sugar`, `rice`

### Demo 2: Udhaar Payment Reminder
```
Manual Trigger → Load Udhaar CSV → Send reminders to overdue customers (>7 days)
```

---

## 🧰 Tech Stack

| Layer | Technology | Why? |
|-------|-----------|------|
| **Frontend** | React 18, Vite, TailwindCSS | Fast dev experience, utility-first CSS |
| **Flow Canvas** | React Flow v11 | Interactive node-based graph editor |
| **State Management** | Zustand | Lightweight, selector-based store |
| **Charts** | Recharts | Composable React charting |
| **Animations** | Framer Motion | Smooth micro-interactions |
| **Icons** | Lucide React | Clean, consistent icon set |
| **Backend** | FastAPI (Python 3.11) | Async-first, auto-docs, Pydantic validation |
| **ORM** | SQLModel + SQLAlchemy | Type-safe database access |
| **Database** | SQLite | Zero-config, file-based, perfect for SMBs |
| **LLM** | Ollama + Qwen3:8B | Free, local, no API keys needed |
| **WhatsApp** | whatsapp-web.js | Real WhatsApp Web protocol |
| **HTTP Client** | httpx (Python), axios (JS) | Async HTTP for inter-service communication |
| **Orchestration** | Docker Compose | One-command setup |

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'feat: add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Areas for Contribution

- 🔌 Google Sheets inventory connector
- 📅 Scheduled trigger support (cron-based)
- 🌐 Multi-language support (Hindi, Tamil, Telugu)
- 📈 More analytics dashboards
- 🧪 Unit and integration tests
- 📱 Mobile-responsive builder

---

## 📄 License

This project is open-sourced under the **MIT License**. See [LICENSE](./LICENSE) for details.

---

## 👤 Author

**Sibam Prasad Sahoo** — [@SIBAM890](https://github.com/SIBAM890)

---

<p align="center">
  <strong>⚡ Built with ❤️ for Indian SMBs</strong><br/>
  <em>Automate your business. No code required.</em>
</p>
