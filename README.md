# AutoFlow - Autonomous WhatsApp Agent Builder

**A pro-code/no-code platform to build, visualize, and deploy intelligent business agents on WhatsApp.**

AutoFlow democratizes AI automation by allowing users to generate complex business logic via natural language, visualize it as a workflow, and deploy it to a live WhatsApp number in seconds—all supported by a real-time inventory database via Google Sheets.

## 📦 Components Overview

### 1. AI Logic Builder (`Builder.jsx`)
**Purpose**: The core interface where users define their agent's behavior using natural language.

**Features**:
- ✅ Text-to-Workflow AI Generation (Gemini)
- ✅ Interactive Workflow Visualization (`ReactFlow`)
- ✅ Real-time Node Editing & Drag-and-drop
- ✅ Voice Input for Natural Language Prompts
- ✅ Live Chat Interface with AI Explanations
- ✅ Custom Node Types for Business Logic

**Usage**:
```tsx
import Builder from "./pages/Builder";

<Builder
  initialPrompt="Create an agent for a shoe store that handles orders, returns, and inventory"
  onDeploy={() => navigate('/deploy-agent')}
/>
```

**Props**:
- `initialPrompt` (string, optional) - Starting prompt for the builder
- `onDeploy` (function, optional) - Callback when user deploys the agent
- `readOnly` (boolean) - Enable/disable editing mode

---

### 2. Live Deployment Engine (`DeployPage.jsx`)
**Purpose**: Handles secure WhatsApp integration with real-time QR code authentication and session management.

**Features**:
- ✅ Real-time QR Code Generation & Streaming
- ✅ Baileys Protocol Integration for WhatsApp Web
- ✅ Session Persistence with Auto-recovery
- ✅ "Already Connected" State Detection
- ✅ Force Logout / Reset Connection Capability
- ✅ Live Agent Status Polling (30s intervals)
- ✅ Connection Stability with Auto-reconnect

**Usage**:
```tsx
import DeployPage from "./pages/DeployPage";

<DeployPage
  onDeploymentSuccess={() => {
    console.log("Agent deployed successfully");
  }}
  onDeploymentError={(error) => {
    console.error("Deployment failed:", error);
  }}
/>
```

**Connection States**:
- **Initializing**: Fetching WhatsApp socket from backend
- **Scan QR**: Waiting for user device authentication
- **Active**: Connected and listening for messages
- **Stopped**: Session invalidated or server unavailable
- **Error**: Connection failed with retry capability

---

### 3. Simulation Sandbox (`TestMode.jsx`)
**Purpose**: Risk-free testing environment for agent behavior before live deployment.

**Features**:
- ✅ Mock WhatsApp Interface with Realistic UI
- ✅ Simulated Bot Typing Indicators
- ✅ Direct Logic Engine Query Testing
- ✅ Debug Logs for Intent Classification
- ✅ Safe Inventory Lookup Testing
- ✅ Message History with Timestamp Tracking

**Usage**:
```tsx
import TestMode from "./components/simulation/TestMode";

<TestMode
  workflowData={currentWorkflow}
  onTestComplete={(results) => {
    console.log("Test results:", results);
  }}
/>
```

**Test Capabilities**:
- Message simulation with various intents
- Inventory query testing
- Response accuracy validation
- Performance metrics collection

---

### 4. ROI Analytics Dashboard (`ROIDashboard.jsx`)
**Purpose**: Comprehensive analytics and performance tracking for deployed agents.

**Features**:
- ✅ Interactive Area Charts (Query Volume vs Resolution)
- ✅ Time Saved & Money Saved Metrics
- ✅ Sentiment Analysis Visualization
- ✅ Response Time Analytics
- ✅ User Satisfaction Tracking
- ✅ Exportable Performance Reports

**Usage**:
```tsx
import ROIDashboard from "./components/dashboard/ROIDashboard";

<ROIDashboard
  agentId={selectedAgentId}
  dateRange={{ start: "2024-01-01", end: "2024-12-31" }}
  refreshInterval={30000}
/>
```

**Metrics Tracked**:
- Total messages processed
- Average response time
- User satisfaction scores
- Business value generated
- Error rates and resolution times

---

### 5. WhatsApp Service Engine (`whatsapp.service.js`)
**Purpose**: Core WhatsApp protocol handling with Baileys integration.

**Features**:
- ✅ Baileys WebSocket Management
- ✅ Message Encryption/Decryption
- ✅ Media File Handling (Images, Documents)
- ✅ Group Chat Support
- ✅ Connection State Monitoring
- ✅ Automatic Reconnection Logic

**Usage**:
```javascript
import { WhatsAppService } from "./services/whatsapp.service.js";

const whatsapp = new WhatsAppService();

await whatsapp.initialize();
await whatsapp.sendMessage(recipientId, { text: "Hello from AutoFlow!" });
```

---

### 6. AI Logic Engine (`engine.service.js`)
**Purpose**: Intelligent intent classification and business logic execution.

**Features**:
- ✅ Natural Language Intent Detection
- ✅ Dynamic Response Generation
- ✅ Google Sheets Database Integration
- ✅ Fallback Handling for Unknown Intents
- ✅ Context-Aware Conversations
- ✅ Multi-language Support

**Usage**:
```javascript
import { EngineService } from "./services/engine.service.js";

const engine = new EngineService();

const intent = await engine.classifyIntent("I want to check my order status");
const response = await engine.generateResponse(intent, userContext);
```

---

### 7. Google Sheets Integration (`googleSheet.service.js`)
**Purpose**: Real-time inventory and data management via Google Sheets API.

**Features**:
- ✅ Read/Write Operations on Google Sheets
- ✅ Automatic Data Synchronization
- ✅ Bulk Data Import/Export
- ✅ Query Optimization for Large Datasets
- ✅ Error Handling and Retry Logic

**Usage**:
```javascript
import { GoogleSheetService } from "./services/googleSheet.service.js";

const sheets = new GoogleSheetService();

const inventory = await sheets.queryInventory("product_id", "ABC123");
await sheets.updateStock("ABC123", newQuantity);
```

---

## 🔧 Installation & Setup

### 1. Environment Variables
Add to `autoflow-backend/.env`:

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Google AI (Gemini)
GEMINI_API_KEY=your_gemini_api_key_here

# Google Sheets Database
GOOGLE_SHEET_ID=your_google_sheet_id
GOOGLE_APPLICATION_CREDENTIALS=./credentials.json

# Optional: Analytics & Monitoring
ANALYTICS_ENABLED=true
LOG_LEVEL=info
```

### 2. Dependencies
**Frontend** (`autoflow-frontend/package.json`):
```bash
✅ react@18.2.0 - UI Framework
✅ reactflow@11.11.4 - Workflow Visualization
✅ recharts@3.7.0 - Analytics Charts
✅ lucide-react@0.563.0 - Icon Library
✅ axios@1.13.2 - HTTP Client
✅ tailwindcss@3.4.17 - Styling Framework
✅ framer-motion@12.29.2 - Animations
✅ qrcode.react@4.2.0 - QR Code Generation
```

**Backend** (`autoflow-backend/package.json`):
```bash
✅ express@5.2.1 - Web Framework
✅ @whiskeysockets/baileys@7.0.0-rc.9 - WhatsApp Protocol
✅ @google/generative-ai@0.24.1 - AI Integration
✅ googleapis@170.1.0 - Google Services
✅ socket.io - Real-time Communication
✅ multer@2.0.2 - File Upload Handling
✅ cors@2.8.6 - Cross-Origin Support
```

### 3. Quick Start
```bash
# 1. Clone and setup backend
cd autoflow-backend
npm install
cp .env.example .env  # Configure your environment variables
npm start

# 2. Setup frontend (in new terminal)
cd ../autoflow-frontend
npm install
npm run dev

# 3. Access the application
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
```

### 4. Google Sheets Setup
1. Create a new Google Sheet for your inventory
2. Enable Google Sheets API in Google Cloud Console
3. Download service account credentials JSON
4. Place `credentials.json` in `autoflow-backend/` directory
5. Share your Google Sheet with the service account email

---

## 🎨 System Architecture

```
Desktop/AutoFlow/
├── autoflow-frontend/              # React SPA (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── builder/            # AI Logic & Chat Interface
│   │   │   ├── dashboard/          # Analytics & ROI Tracking
│   │   │   ├── landing/            # Marketing Pages
│   │   │   ├── simulation/         # Test Environment
│   │   │   └── visualization/      # Workflow Graphs
│   │   ├── pages/                  # Route Components
│   │   ├── services/               # API Integration
│   │   ├── constants/              # Tools & Configuration
│   │   └── hooks/                  # Custom React Hooks
│   ├── public/                     # Static Assets
│   └── index.html                  # App Entry Point
│
├── autoflow-backend/               # Node.js API Server
│   ├── src/
│   │   ├── controllers/            # Route Handlers
│   │   │   ├── upload.controller.js
│   │   │   ├── whatsapp.controller.js
│   │   │   └── workflow.controller.js
│   │   ├── services/               # Business Logic
│   │   │   ├── whatsapp.service.js # Baileys Integration
│   │   │   ├── engine.service.js   # AI Intent Processing
│   │   │   ├── ai.service.js       # Gemini AI Integration
│   │   │   ├── googleSheet.service.js # Data Management
│   │   │   └── file.service.js     # File Operations
│   │   ├── routes/                 # API Endpoints
│   │   └── config/                 # Environment Config
│   ├── auth_info_baileys/          # WhatsApp Sessions (GitIgnored)
│   ├── uploads/                    # File Storage
│   └── server.js                   # Express App Entry
```

**Data Flow Architecture**:
```
User Message (WhatsApp)
    ↓
WhatsApp Service (Baileys WebSocket)
    ↓
Message Processing Pipeline
    ↓
Intent Classification (AI Engine)
    ↓
Business Logic Execution
    ↓
Google Sheets Database Query
    ↓
AI Response Generation (Gemini)
    ↓
WhatsApp Service (Send Reply)
    ↓
Analytics Tracking (ROI Dashboard)
```

---

## 🎯 Integration Guide

### Example: Adding Custom Business Logic
To extend the AI engine with custom intents:

```javascript
// src/services/engine.service.js

// 1. Add Intent Detection
else if (lowerMsg.includes("custom_action") || lowerMsg.includes("special_request")) {
    intent = "handle_custom_action";
}

// 2. Implement Handler Logic
if (intent === "handle_custom_action") {
    // Query your custom data
    const customData = await googleSheets.queryCustomTable(userInput);

    // Generate AI-powered response
    const aiResponse = await aiService.generateResponse({
        intent: "custom_action",
        context: customData,
        userMessage: message
    });

    replyText = aiResponse;
    await sock.sendMessage(sender, { text: replyText });
}
```

### Example: Integrating New Data Sources
Adding support for external APIs:

```javascript
// src/services/external.service.js

class ExternalAPIService {
    async queryExternalData(query) {
        try {
            const response = await axios.get(`https://api.external.com/search?q=${query}`);
            return this.formatForAutoFlow(response.data);
        } catch (error) {
            console.error("External API error:", error);
            return null;
        }
    }

    formatForAutoFlow(externalData) {
        // Transform external data to match AutoFlow's expected format
        return {
            items: externalData.results,
            total: externalData.totalCount,
            source: "external_api"
        };
    }
}
```

### Example: Custom Workflow Node Types
Creating specialized nodes for your business:

```tsx
// src/components/visualization/CustomNode.jsx

export function InventoryNode({ data }) {
    return (
        <div className="custom-node inventory-node">
            <div className="node-header">
                <PackageIcon className="w-4 h-4" />
                <span>Inventory Check</span>
            </div>
            <div className="node-content">
                <p>Product: {data.productId}</p>
                <p>Action: {data.action}</p>
            </div>
        </div>
    );
}

// Register in WorkflowGraph.jsx
const nodeTypes = {
    inventory: InventoryNode,
    order: OrderNode,
    payment: PaymentNode,
    custom: CustomNode
};
```

---

## 🔐 Security Considerations

1. **Local Session Storage**: WhatsApp credentials stored locally in `auth_info_baileys/` - never committed to version control
2. **Environment Variables**: All sensitive keys (Google AI, Sheets API) managed via `.env` files
3. **QR Code Authentication**: Physical device authentication prevents unauthorized access
4. **Auto Session Cleanup**: Backend automatically removes invalid/corrupt sessions
5. **API Rate Limiting**: Built-in protection against abuse on all endpoints
6. **Data Encryption**: All WhatsApp messages encrypted end-to-end by protocol
7. **Access Control**: Google Sheets shared only with authorized service accounts

---

## 🐛 Troubleshooting

### "Stream Errored (restart required)"
**Cause**: Network interruption or WhatsApp session conflict
**Solution**: System features auto-recovery - wait 5 seconds for automatic reconnection

### "WhatsApp connection already in progress"
**Cause**: Multiple deployment attempts or background connection
**Solution**: Use "Reset Connection" button on DeployPage to force cleanup

### "Google Sheets API Error: 403"
**Cause**: Insufficient permissions or invalid credentials
**Solution**:
1. Verify `credentials.json` is in `autoflow-backend/`
2. Ensure service account has edit access to Google Sheet
3. Check `GOOGLE_SHEET_ID` in `.env`

### "AI Generation Failed"
**Cause**: Invalid Gemini API key or quota exceeded
**Solution**:
1. Verify `GEMINI_API_KEY` in `.env`
2. Check Google AI Studio quota limits
3. Implement retry logic with exponential backoff

### QR Code Not Appearing
**Cause**: Existing active session or backend not ready
**Solution**: Click "Reset Connection / Log out" to generate fresh QR code

### "Module not found" Errors
**Cause**: Missing dependencies or incorrect installation
**Solution**:
```bash
# Frontend
cd autoflow-frontend && rm -rf node_modules && npm install

# Backend
cd autoflow-backend && rm -rf node_modules && npm install
```

---

## 📊 Component Status

| Component | Status | Tests | Documentation |
|-----------|--------|-------|---------------|
| **AI Logic Builder** | ✅ Complete | ✅ Unit Tests | ✅ Complete |
| **Live Deployment Engine** | ✅ Complete | ✅ Integration Tests | ✅ Complete |
| **Simulation Sandbox** | ✅ Complete | ✅ E2E Tests | ✅ Complete |
| **ROI Analytics Dashboard** | ✅ Complete | ⏳ Pending | ✅ Complete |
| **WhatsApp Service** | ✅ Stable | ✅ Integration Tests | ✅ Complete |
| **AI Engine Service** | ✅ Active | ✅ Unit Tests | ✅ Complete |
| **Google Sheets Integration** | ✅ Verified | ✅ Integration Tests | ✅ Complete |
| **File Upload Service** | ✅ Complete | ⏳ Pending | ✅ Complete |

---

## 🚀 Next Steps & Roadmap

1. **Multi-Agent Support** - Deploy multiple specialized agents
2. **Advanced Analytics** - Customer journey mapping and conversion tracking
3. **Plugin System** - Third-party integrations (CRM, ERP, Payment)
4. **Voice Message Support** - WhatsApp voice note processing
5. **Multi-language Support** - Expand beyond English intents
6. **Mobile App** - Native iOS/Android companion apps
7. **Team Collaboration** - Multi-user agent building and management

---

## 📝 API Endpoints

### WhatsApp Integration
- `POST /api/whatsapp/deploy` - Initialize WhatsApp connection / Generate QR
- `GET /api/whatsapp/status` - Poll connection state and agent status
- `POST /api/whatsapp/logout` - Force session destruction and cleanup
- `POST /api/whatsapp/send-message` - Send test messages (development only)

### Workflow Management
- `POST /api/generate-workflow` - AI-powered workflow generation from text
- `POST /api/simulate-message` - Test agent responses in sandbox mode
- `GET /api/workflow/validate` - Validate workflow logic and connections

### Analytics & Monitoring
- `GET /api/analytics/overview` - Get agent performance metrics
- `GET /api/analytics/messages` - Retrieve message history and analytics
- `POST /api/analytics/export` - Export performance reports

### File Operations
- `POST /api/upload` - Handle file uploads (images, documents)
- `GET /api/files/:id` - Retrieve uploaded files
- `DELETE /api/files/:id` - Remove uploaded files

### Google Sheets Integration
- `GET /api/sheets/query` - Query inventory and data
- `POST /api/sheets/update` - Update sheet data
- `POST /api/sheets/bulk-import` - Import data from CSV/Excel

---

## 📚 Related Documentation

- [Frontend Architecture](./docs/frontend-architecture.md)
- [Backend API Reference](./docs/backend-api.md)
- [Workflow Engine Guide](./docs/workflow-engine.md)
- [Google Sheets Integration](./docs/google-sheets-setup.md)
- [Deployment Guide](./docs/deployment-guide.md)
- [Contributing Guidelines](./docs/contributing.md)

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](./docs/contributing.md) for details on:

- Code style and standards
- Testing requirements
- Pull request process
- Issue reporting

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Baileys** - WhatsApp Web API implementation
- **Google Gemini AI** - Natural language processing
- **React Flow** - Workflow visualization
- **Tailwind CSS** - Utility-first styling
- **Vite** - Fast build tool and dev server

---

**Last Updated**: January 30, 2026  
**Version**: 1.2.0  
**Status**: ✅ Production Ready
