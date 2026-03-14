import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models import Template, Workflow

router = APIRouter(prefix="/api/templates", tags=["Templates"])

@router.get("")
def list_templates(db: Session = Depends(get_session)):
    return db.exec(select(Template)).all()

@router.post("/{id}/fork")
def fork_template(id: str, db: Session = Depends(get_session)):
    template = db.get(Template, id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
        
    wf_id = str(uuid.uuid4())
    workflow = Workflow(
        id=wf_id,
        name=f"Copy of {template.name}",
        description=template.description,
        nodes=template.nodes,
        edges=template.edges,
        is_active=False
    )
    db.add(workflow)
    
    template.use_count += 1
    db.add(template)
    
    db.commit()
    db.refresh(workflow)
    return {"success": True, "workflow": workflow.id}
