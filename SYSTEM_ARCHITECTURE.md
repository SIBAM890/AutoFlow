```mermaid
graph TD
    User([Customer (WhatsApp)])
    WebVisitor([Website Visitor)])
    Admin([Admin / Business Owner])
    WA_Servers[WhatsApp Servers]
    Google_AI[Google Gemini AI]
    Google_Sheets[Google Sheets (DB)]

    subgraph Frontend_React_Vite["Frontend (React + Vite)"]
        direction TB
        subgraph Public_Facing["Public Facing"]
            Landing_Page[Landing Page]
            Hero[Hero Section]
            Navbar[Navigation Navbar]
        end
        
        subgraph App_Dashboard["App / Dashboard"]
            UI_Auth[Auth / Login]
            UI_Builder[Logic Builder (ReactFlow)]
            UI_Deploy[Deployment Manager]
            UI_Dashboard[ROI Dashboard]
            UI_Sim[Simulator]
        end
    end

    subgraph Backend_Node_Express["Backend (Node.js + Express)"]
        API[API Routes (/api)]
        
        subgraph Controllers["Controllers"]
            Ctrl_WA[WhatsApp Controller]
            Ctrl_WF[Workflow Controller]
        end
        
        subgraph Core_Services["Core Services"]
            Svc_WA[WhatsApp Service (Baileys)]
            Svc_Engine[Logic Engine]
            Svc_AI[AI Service]
            Svc_Sheets[Google Sheet Service]
        end
        
        Session_Store[Local Session Store]
    end

    User -->|E2E Encrypted| WA_Servers
    WebVisitor -->|Visits| Landing_Page
    Landing_Page --> Navbar
    Landing_Page --> Hero
    Navbar -->|Login| UI_Auth
    UI_Auth --> UI_Dashboard
    
    Admin -->|HTTP / WebSocket| UI_Dashboard
    Admin -->|Interacts| UI_Builder

    UI_Deploy -->|POST /whatsapp/deploy| API
    UI_Sim -->|POST /simulate-message| API
    UI_Builder -->|POST /generate-workflow| API

    API --> Ctrl_WA
    API --> Ctrl_WF
    
    Ctrl_WA --> Svc_WA
    Ctrl_WF --> Svc_AI

    Svc_WA -->|WebSocket| WA_Servers
    Svc_WA -->|Persist Auth| Session_Store
    Svc_WA -->|Incoming Msg| Svc_Engine
    Svc_Engine -->|Reply| Svc_WA

    Svc_Engine -->|Read/Write| Svc_Sheets
    Svc_Engine -.->|AI Logic| Svc_AI
    
    Svc_Sheets -->|REST API| Google_Sheets
    Svc_AI -->|REST API| Google_AI
```
