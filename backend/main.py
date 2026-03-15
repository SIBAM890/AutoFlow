from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlmodel import Session, select
import asyncio

from database import create_db_and_tables, get_session, engine
import models
from schemas import WorkflowGenerateRequest, WorkflowSchema
from ollama_client import generate_workflow, explain_workflow
from executor import WorkflowExecutor
from seeder import seed_database

# Routers
from routers.inventory import router as inventory_router
from routers.templates import router as templates_router
from routers.audit import router as audit_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    # Seed DB with initial data
    with Session(engine) as session:
        seed_database(session)
    yield

app = FastAPI(lifespan=lifespan, title="AutoFlow OSS Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(inventory_router)
app.include_router(templates_router)
app.include_router(audit_router)

@app.get("/docs")
def health():
    return {"status": "ok"}

@app.post("/api/workflow/generate")
async def api_generate_workflow(request: WorkflowGenerateRequest):
    try:
        # B1. Generate JSON via Ollama
        workflow_json = await generate_workflow(request.nl_input)
        
        # B2. Validate JSON against Pydantic constraint immediately
        # (This will throw ValidationError if Ollama hallucinations don't match the schema)
        # Using WorkflowSchema as a loose wrapper for the node list
        validated = WorkflowSchema(name="Generated Workflow", nodes=workflow_json.get("nodes", []), edges=workflow_json.get("edges", []))
        
        # B2. Generate Plain English Explanation
        explanation = await explain_workflow(validated.dict())
        
        return {
            "success": True,
            "workflow": validated.dict(),
            "explanation": explanation
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/whatsapp/incoming")
async def api_whatsapp_incoming(payload: dict, background_tasks: BackgroundTasks, db: Session = Depends(get_session)):
    """
    B5. Webhook listener from Node.js Whatsapp-Bridge
    """
    message_text = payload.get("message", "").lower()
    from_number = payload.get("from")
    
    if not message_text or not from_number:
         return {"status": "ignored"}
         
    # Query all active workflows
    active_workflows = db.exec(select(models.Workflow).where(models.Workflow.is_active == True)).all()
    
    matches = []
    
    for workflow in active_workflows:
        # Load the JSON
        workflow_json = {"nodes": workflow.nodes, "edges": workflow.edges}
        trigger_node = next((n for n in workflow_json["nodes"] if n["type"] == "trigger"), None)
        
        if not trigger_node:
            continue
            
        config = trigger_node.get("data", {}).get("config", {})
        keywords = config.get("keywords", [])
        
        # Basic match check
        if any(keyword.lower() in message_text for keyword in keywords):
             executor = WorkflowExecutor(db_session=db)
             
             trigger_data = {
                 "from": from_number,
                 "message": message_text,
                 "raw": payload
             }
             
             # Schedule execution in background
             background_tasks.add_task(
                 executor.execute, 
                 workflow_id=workflow.id, 
                 workflow_name=workflow.name, 
                 workflow_json=workflow_json, 
                 trigger_type="whatsapp_message", 
                 trigger_data=trigger_data
             )
             matches.append(workflow.name)
             
    return {"status": "processed", "matches": len(matches), "matched_workflows": matches}

