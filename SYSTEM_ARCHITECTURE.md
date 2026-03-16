# 🏗️ AutoFlow OSS — System Architecture

> This document provides a comprehensive technical deep-dive into AutoFlow's system design, data flows, component interactions, and design decisions.

---

## Table of Contents

1. [High-Level Architecture](#1-high-level-architecture)
2. [Service Topology](#2-service-topology)
3. [Data Flow Diagrams](#3-data-flow-diagrams)
4. [Frontend Architecture](#4-frontend-architecture)
5. [Backend Architecture](#5-backend-architecture)
6. [WhatsApp Bridge Architecture](#6-whatsapp-bridge-architecture)
7. [LLM Integration Layer](#7-llm-integration-layer)
8. [Workflow Executor Engine](#8-workflow-executor-engine)
9. [Database Design](#9-database-design)
10. [Inter-Service Communication](#10-inter-service-communication)
11. [Security Considerations](#11-security-considerations)
12. [Scalability & Future Architecture](#12-scalability--future-architecture)

---

## 1. High-Level Architecture

AutoFlow is a **4-service microservice architecture** orchestrated via Docker Compose, designed for simplicity and self-hosted deployment on commodity hardware.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          HOST MACHINE                                   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                     Docker Compose Network                       │    │
│  │                                                                  │    │
│  │   ┌─────────────┐    REST    ┌─────────────┐    REST    ┌─────┐ │    │
│  │   │  FRONTEND   │──────────→│   BACKEND    │──────────→│OLLAM│ │    │
│  │   │  React+Vite │           │   FastAPI    │           │  A  │ │    │
│  │   │  :3000      │           │   :8000      │           │:1143│ │    │
│  │   └─────────────┘           └──────┬───────┘           │  4  │ │    │
│  │                                    │                    └─────┘ │    │
│  │                                    │ REST                       │    │
│  │                                    ▼                            │    │
│  │                             ┌─────────────┐                     │    │
│  │                             │  WHATSAPP   │                     │    │
│  │                             │   BRIDGE    │                     │    │
│  │                             │  Node.js    │                     │    │
│  │                             │  :3001      │                     │    │
│  │                             └──────┬──────┘                     │    │
│  │                                    │                            │    │
│  │                                    ▼                            │    │
│  │                           WhatsApp Web                          │    │
│  │                           Protocol                              │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│   ┌───────────┐   ┌──────────────┐                                     │
│   │ ./data/   │   │   Docker     │                                     │
│   │  SQLite   │   │   Volumes    │                                     │
│   │  CSVs     │   │  (ollama,    │                                     │
│   │           │   │   whatsapp)  │                                     │
│   └───────────┘   └──────────────┘                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

### Design Principles

| Principle | Implementation |
|-----------|---------------|
| **Self-Hosted First** | No external APIs. LLM runs locally via Ollama. |
| **Zero Configuration** | Single `docker-compose up` starts everything. |
| **Offline Capable** | Works without internet after initial setup. |
| **SMB-Friendly** | SQLite (no Postgres setup), CSV imports (no fancy integrations). |
| **Developer Experience** | Hot-reload for both frontend and backend via volume mounts. |

---

## 2. Service Topology

### 2.1 Frontend Service

```yaml
Image:    node:18-alpine
Port:     3000
Framework: React 18 + Vite 5
Styling:   TailwindCSS 3
State:     Zustand
Flow:      React Flow v11
Charts:    Recharts
```

**Responsibilities:**
- Render visual workflow builder with drag-and-drop nodes
- Accept natural language input and call backend `/api/workflow/generate`
- Display AI-generated explanations
- Show analytics dashboard with performance metrics
- Handle WhatsApp deployment flow with QR code display

### 2.2 Backend Service

```yaml
Image:    python:3.11-slim
Port:     8000
Framework: FastAPI (async)
ORM:       SQLModel + SQLAlchemy
Database:  SQLite
LLM:       Ollama (via httpx)
```

**Responsibilities:**
- REST API for all CRUD operations
- Natural language → workflow JSON conversion via Ollama
- Workflow execution engine (graph traversal)
- WhatsApp webhook listener (`/api/whatsapp/incoming`)
- Audit logging for every execution
- Database seeding with templates and demo workflows

### 2.3 WhatsApp Bridge Service

```yaml
Image:    node:18-alpine + Chromium
Port:     3001
Framework: Express.js
Library:   whatsapp-web.js (Puppeteer-based)
```

**Responsibilities:**
- Manage WhatsApp Web session via headless Chromium
- Generate QR codes for phone linking
- Forward incoming messages to backend webhook
- Send individual and broadcast messages
- Persist session data across container restarts

### 2.4 Ollama Service

```yaml
Image:    ollama/ollama (official)
Port:     11434
Model:    qwen3:8b
```

**Responsibilities:**
- Serve the Qwen3:8B model for inference
- Auto-pull the model on first startup
- Provide `/api/chat` endpoint for structured JSON generation

---

## 3. Data Flow Diagrams

### 3.1 Workflow Generation Flow

```
User types: "When customer asks about stock, check inventory and reply"
    │
    ▼
┌──────────────┐     POST /api/workflow/generate
│   Frontend   │────────────────────────────────→┌──────────────┐
│  NLInputPanel│                                  │   Backend    │
└──────────────┘                                  │   main.py    │
                                                  └──────┬───────┘
                                                         │
                                      POST /api/chat     │
                                      (system + user     │
                                       prompts)          ▼
                                                  ┌──────────────┐
                                                  │    Ollama     │
                                                  │  qwen3:8b     │
                                                  └──────┬───────┘
                                                         │
                                       JSON response     │
                                       { nodes, edges }  │
                                                         ▼
                                                  ┌──────────────┐
                                                  │   Backend    │
                                                  │ validates    │
                                                  │ against      │
                                                  │ WorkflowSchema│
                                                  └──────┬───────┘
                                                         │
                                      explanation text   │
                                      + workflow JSON    │
                                                         ▼
┌──────────────┐     { workflow, explanation }    ┌──────────────┐
│   Frontend   │←────────────────────────────────│   Backend    │
│ WorkflowGraph│                                  └──────────────┘
│  renders nodes│
└──────────────┘
```

### 3.2 Message Processing Flow (Runtime)

```
Customer sends WhatsApp message: "Do you have sugar?"
    │
    ▼
┌──────────────┐     POST WEBHOOK
│  WhatsApp    │────────────────→┌──────────────┐
│   Bridge     │                  │   Backend    │
│  server.js   │                  │  /api/whatsapp│
└──────────────┘                  │  /incoming   │
                                  └──────┬───────┘
                                         │
                                    For each active
                                    workflow, check
                                    keyword match
                                         │
                                    Match found!
                                    "sugar" ∈ keywords
                                         │
                                         ▼
                                  ┌──────────────┐
                                  │  Executor    │
                                  │  engine      │
                                  │  traverses   │
                                  │  node graph  │
                                  └──────┬───────┘
                                         │
                           ┌─────────────┼──────────────┐
                           │             │              │
                           ▼             ▼              ▼
                    Inventory       Condition        WhatsApp
                    Lookup          (qty > 0?)       Send Reply
                    (CSV search)    ├─ True ──→     "Sugar available"
                                    └─ False ──→    "Out of stock"
                                         │
                                         ▼
                                  ┌──────────────┐     POST /send
                                  │   Backend    │────────────→┌──────────┐
                                  │              │              │  Bridge  │
                                  └──────────────┘              └──────┬───┘
                                         │                             │
                                  Audit Log                     WhatsApp
                                  saved to                      reply sent
                                  SQLite                        to customer
```

### 3.3 Deploy Agent Flow

```
User clicks "Deploy Agent" on frontend
    │
    ▼
┌──────────────┐     GET /status (poll every 2s)
│  DeployPage  │────────────────────────────────→┌──────────────┐
│  frontend    │                                  │  WhatsApp    │
└──────────────┘                                  │   Bridge     │
       │                                          └──────┬───────┘
       │                                                 │
       │◀──── { qr: "data:..." } ───────────────────────┘
       │
       ▼
  Display QR Code
  (QRCodeSVG component)
       │
  User scans with phone
       │
       ▼
┌──────────────┐     GET /status → { connected: true }
│  DeployPage  │←────────────────────────────────────────┐
│  shows ✅    │                                          │
│  "Agent Live"│                                   ┌────────────┐
└──────────────┘                                   │   Bridge   │
                                                   │ emits      │
                                                   │ "ready"    │
                                                   └────────────┘
```

---

## 4. Frontend Architecture

### 4.1 Component Hierarchy

```
App.jsx (Router)
├── LandingPage.jsx
├── Dashboard.jsx
│   └── ROIDashboard.jsx (Recharts metrics)
├── Builder.jsx
│   ├── TopBar.jsx (Save / Activate)
│   ├── WorkflowGraph.jsx (React Flow canvas)
│   │   ├── CustomNode.jsx (base renderer)
│   │   ├── TriggerNode.jsx
│   │   ├── ActionNode.jsx
│   │   ├── ConditionNode.jsx
│   │   ├── WhatsAppNode.jsx
│   │   ├── InventoryNode.jsx
│   │   └── DelayNode.jsx
│   ├── NodeConfigPanel.jsx (side panel)
│   ├── NLInputPanel.jsx (bottom bar)
│   └── AIExplainerPanel.jsx
├── Templates.jsx
├── DeployPage.jsx (QR + Chat simulator)
└── NotFound.jsx
```

### 4.2 State Management (Zustand)

```javascript
workflowStore = {
  nodes: [],           // React Flow node objects
  edges: [],           // React Flow edge objects
  currentWorkflow: {}, // Metadata (id, name, description)
  isActive: false,     // Workflow activation status
  explanation: null,   // AI-generated explanation text
  selectedNode: null,  // Currently selected node for config panel

  // Actions
  setNodes, setEdges,
  onNodesChange, onEdgesChange,  // React Flow change handlers
  setCurrentWorkflow, setIsActive,
  setExplanation, setSelectedNode,
  updateNodeData(id, newData)    // Granular node data update
}
```

### 4.3 Custom Node System

Each node type is a React component that wraps React Flow's `Handle` components:

| Node | Color | Icon | Handles |
|------|-------|------|---------|
| TriggerNode | Dark green | ⚡ Lightning | Output only (right) |
| ActionNode | Dark blue | ⚙️ Gear | Input (left) + Output (right) |
| ConditionNode | Amber | 🔷 Diamond | Input (left) + True (green right) + False (red right) |
| WhatsAppNode | Emerald | 💬 WhatsApp | Input (left) + Output (right) |
| InventoryNode | Orange | 📦 Box | Input (left) + Output (right) |
| DelayNode | Purple | ⏰ Clock | Input (left) + Output (right) |

### 4.4 Auto-Layout Algorithm

The `getLayoutedElements()` function in `WorkflowGraph.jsx` implements a **horizontal directed graph layout**:

1. **Depth Calculation** — Uses edge relaxation (similar to Bellman-Ford) to compute the longest path depth for each node
2. **Column Grouping** — Nodes at the same depth are placed in the same vertical column
3. **Position Assignment** — X position = `depth × 350 + 100`, Y position = centered within column

This ensures AI-generated workflows are automatically arranged left-to-right.

---

## 5. Backend Architecture

### 5.1 Module Dependency Graph

```
main.py (FastAPI app)
├── database.py (SQLite engine + sessions)
├── models.py (SQLModel ORM: Workflow, Template, AuditLog, InventorySource)
├── schemas.py (Pydantic: WorkflowSchema, WorkflowGenerateRequest)
├── ollama_client.py (LLM: generate_workflow, explain_workflow)
├── executor.py (WorkflowExecutor class)
├── seeder.py (Database seeding)
└── routers/
    ├── inventory.py (CSV upload + search)
    ├── templates.py (CRUD + fork)
    └── audit.py (Query logs)
```

### 5.2 Request Processing Pipeline

```
HTTP Request → CORSMiddleware → FastAPI Router → Handler → Response
                                                    │
                                              ┌─────┴─────┐
                                              │ SQLModel   │
                                              │ Session    │
                                              │ (dep inj)  │
                                              └────────────┘
```

### 5.3 Middleware Stack

| Order | Middleware | Purpose |
|-------|-----------|---------|
| 1 | CORSMiddleware | Allow cross-origin requests from frontend (:3000) |
| 2 | FastAPI default | Request parsing, validation, response serialization |

### 5.4 API Router Structure

```
/api/
├── workflow/
│   ├── POST   /generate        → ollama_client.generate_workflow()
│   ├── POST   /save            → Workflow.create()
│   ├── GET    /list            → Workflow.select_all()
│   ├── GET    /{id}            → Workflow.get()
│   ├── POST   /{id}/activate   → Workflow.update(is_active=True)
│   ├── POST   /{id}/deactivate → Workflow.update(is_active=False)
│   └── POST   /{id}/execute    → WorkflowExecutor.execute()
├── templates/
│   ├── GET    /                → Template.select_all()
│   ├── GET    /{id}            → Template.get()
│   └── POST   /{id}/fork       → Template → Workflow copy
├── inventory/
│   ├── POST   /upload          → Save CSV to data/
│   ├── GET    /list            → InventorySource.select_all()
│   └── GET    /{id}/data       → Parse CSV → JSON
├── audit/
│   ├── GET    /                → AuditLog.select_all()
│   └── GET    /{workflow_id}   → AuditLog.filter(workflow_id)
└── whatsapp/
    └── POST   /incoming        → Webhook from Bridge → Executor
```

---

## 6. WhatsApp Bridge Architecture

### 6.1 Session Lifecycle

```
Container Start
    │
    ├── Clean stale SingletonLock files
    ├── Initialize whatsapp-web.js Client
    │   └── Puppeteer launches headless Chromium
    │
    ├── Event: 'qr' → Store QR string, log to terminal
    ├── Event: 'ready' → Set connected=true, clear QR
    ├── Event: 'message' → Forward to backend webhook
    └── Event: 'disconnected' → Reset state
```

### 6.2 Message Flow

```
Incoming WhatsApp Message
    │
    ▼
whatsapp-web.js client.on('message')
    │
    ├── Filter: Ignore status@broadcast
    │
    ▼
POST http://backend:8000/api/whatsapp/incoming
    {
        from: "919876543210@c.us",
        message: "do you have sugar?",
        timestamp: 1710518400
    }
```

### 6.3 Session Persistence

WhatsApp session data is stored in a Docker named volume `whatsapp_session` mapped to `/app/.wwebjs_auth`. This ensures the session survives container restarts without needing to re-scan the QR code.

---

## 7. LLM Integration Layer

### 7.1 Prompt Architecture

```
┌─────────────────────────────────────────────┐
│              SYSTEM PROMPT                   │
│  - Available node types                      │
│  - Response format rules                     │
│  - {{variable}} syntax requirement           │
│  - "Return ONLY valid JSON"                  │
└─────────────────────────────────────────────┘
                    +
┌─────────────────────────────────────────────┐
│              USER PROMPT                     │
│  Business automation request: "{nl_input}"   │
│  Generate complete workflow JSON              │
└─────────────────────────────────────────────┘
                    │
                    ▼
            Ollama /api/chat
            (qwen3:8b, temp=0.2)
                    │
                    ▼
┌─────────────────────────────────────────────┐
│           JSON CLEANING                      │
│  - Strip ```json``` markers                  │
│  - Trim whitespace                           │
│  - json.loads() parse                        │
└─────────────────────────────────────────────┘
                    │
              On failure
                    ▼
┌─────────────────────────────────────────────┐
│          STRICT RETRY PROMPT                 │
│  "You failed to generate valid JSON"         │
│  "Start with { and end with }"               │
│  Temperature lowered to 0.1                  │
└─────────────────────────────────────────────┘
```

### 7.2 Error Handling Strategy

| Error | Handling | Max Retries |
|-------|----------|-------------|
| Ollama connection timeout | Wait 2s, retry | 3 |
| Invalid JSON from LLM | Retry with stricter prompt | 1 (strict mode) |
| Schema validation failure | Return 500 with error | 0 |

---

## 8. Workflow Executor Engine

### 8.1 Execution Algorithm

```python
def execute(workflow_json, trigger_data):
    # 1. Build node lookup map: { node_id → node }
    # 2. Build adjacency map: { source_id → [{ target, label }] }
    # 3. Initialize context: { trigger: trigger_data, results: {} }
    # 4. Find trigger node
    # 5. DFS traversal starting from trigger:
    #    - For each node:
    #      a. Record in actions_taken
    #      b. Execute node-type-specific logic
    #      c. Store result in context.results[node_id]
    #      d. Follow outgoing edges:
    #         - Unconditional → always follow
    #         - Conditional → only follow matching "true"/"false" branch
    # 6. Log audit entry (success or failure)
```

### 8.2 Supported Action Types

| Action Type | Input | Output | Effect |
|-------------|-------|--------|--------|
| `inventory_lookup` | CSV file, search query from trigger message | `{ found, product, quantity, price }` | Searches CSV for matching product |
| `send_whatsapp` | `{ to, message }` with template vars | `{ status: "sent" }` | Sends WhatsApp via bridge |
| `send_broadcast` | Customer list from CSV + message | `{ status: "broadcast_sent" }` | Mass message via bridge |
| `load_udhaar_list` | Udhaar CSV file | `{ status: "reminders_sent" }` | Sends reminders to overdue customers |
| `load_customers` | Customers CSV file | Phone number list | Loads broadcast recipient list |
| `log_payment` | Payment data | `{ status: "logged" }` | Records payment |

### 8.3 Template Variable Resolution

The `_resolve_template()` method uses regex to replace `{{path.to.value}}` placeholders:

```python
# Input:  "Hello {{trigger.from}}, {{results.inventory_1.product}} has {{results.inventory_1.quantity}} units"
# Context: { trigger: { from: "John" }, results: { inventory_1: { product: "Sugar", quantity: 50 } } }
# Output: "Hello John, Sugar has 50 units"
```

---

## 9. Database Design

### 9.1 Entity-Relationship Diagram

```
┌──────────────┐         ┌──────────────┐
│   Workflow    │         │   Template   │
├──────────────┤         ├──────────────┤
│ id (PK)      │         │ id (PK)      │
│ name         │         │ name         │
│ description  │         │ category     │
│ nl_input     │         │ nodes (JSON) │
│ nodes (JSON) │         │ edges (JSON) │
│ edges (JSON) │         │ use_count    │
│ is_active    │         │ created_at   │
│ created_at   │         └──────────────┘
│ updated_at   │
└──────┬───────┘
       │ 1:N
       ▼
┌──────────────┐         ┌──────────────────┐
│  AuditLog    │         │ InventorySource  │
├──────────────┤         ├──────────────────┤
│ id (PK)      │         │ id (PK)          │
│ workflow_id  │←FK      │ name             │
│ workflow_name│         │ type             │
│ trigger_type │         │ file_path        │
│ trigger_data │         │ sheet_url        │
│ actions_taken│         │ last_synced      │
│ result       │         │ created_at       │
│ error_message│         └──────────────────┘
│ executed_at  │
└──────────────┘
```

### 9.2 Design Decisions

| Decision | Rationale |
|----------|-----------|
| **SQLite over Postgres** | Zero-config, single file, perfect for single-machine deployment |
| **JSON columns for nodes/edges** | Avoids complex relational modeling of graph structures |
| **Separate Template table** | Templates are read-only references, workflows are user-editable forks |
| **Audit table per-execution** | Full traceability; every trigger → result is recorded |

---

## 10. Inter-Service Communication

### 10.1 Communication Matrix

| From | To | Protocol | Endpoint | Purpose |
|------|-----|----------|----------|---------|
| Frontend | Backend | HTTP REST | `:8000/api/*` | All CRUD + AI generation |
| Backend | Ollama | HTTP REST | `:11434/api/chat` | LLM inference |
| Backend | Bridge | HTTP REST | `:3001/send`, `/broadcast` | Send WhatsApp messages |
| Bridge | Backend | HTTP POST | `:8000/api/whatsapp/incoming` | Forward incoming messages |
| Frontend | Bridge | HTTP GET | `:3001/status`, `/qr` | Check connection, get QR |

### 10.2 Docker Networking

All services communicate via Docker Compose's default bridge network. Service names (`backend`, `frontend`, `whatsapp-bridge`, `ollama`) resolve to container IPs automatically.

---

## 11. Security Considerations

| Area | Current State | Recommendation |
|------|--------------|----------------|
| **Authentication** | None (dev mode) | Add JWT-based auth for production |
| **CORS** | `allow_origins=["*"]` | Restrict to specific frontend origin |
| **WhatsApp Session** | Persisted in Docker volume | Encrypt session data at rest |
| **Database** | SQLite file on host | Use file permissions, consider encryption |
| **LLM Prompt Injection** | Basic input cleaning | Add input sanitization layer |
| **API Rate Limiting** | None | Add FastAPI rate limiter middleware |

---

## 12. Scalability & Future Architecture

### Current Limitations
- Single-instance SQLite (no concurrent writes)
- Single WhatsApp session per bridge
- CPU-only LLM inference (slow on large models)

### Proposed Future Architecture

```
                    ┌──────────────┐
                    │   Nginx      │
                    │   Reverse    │
                    │   Proxy      │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ Frontend │ │ Backend  │ │ Backend  │
        │ (CDN)    │ │ Worker 1 │ │ Worker 2 │
        └──────────┘ └────┬─────┘ └────┬─────┘
                          │            │
                     ┌────┴────────────┴────┐
                     │     PostgreSQL        │
                     │     + Redis Cache     │
                     └───────────────────────┘
                                │
                     ┌──────────┴──────────┐
                     │   Message Queue     │
                     │   (RabbitMQ/Redis)  │
                     └──────────┬──────────┘
                                │
                     ┌──────────┴──────────┐
                     │  Executor Workers   │
                     │  (async processing) │
                     └─────────────────────┘
```

### Roadmap Items
- [ ] PostgreSQL migration for multi-user support
- [ ] Redis caching for LLM responses
- [ ] Message queue for async workflow execution
- [ ] GPU acceleration for Ollama (CUDA/ROCm)
- [ ] Multi-phone WhatsApp session management
- [ ] Scheduled trigger support (cron-based)
- [ ] Google Sheets inventory connector
- [ ] Multi-language UI (Hindi, Tamil, Telugu)
- [ ] Mobile-responsive workflow builder
- [ ] Workflow versioning and rollback

---

<p align="center">
  <em>Architecture designed for simplicity today, scalability tomorrow.</em>
</p>
