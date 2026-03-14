from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from database import get_session
from models import AuditLog

router = APIRouter(prefix="/api/audit", tags=["Audit"])

@router.get("")
def list_logs(limit: int = 50, offset: int = 0, db: Session = Depends(get_session)):
    logs = db.exec(select(AuditLog).order_by(AuditLog.executed_at.desc()).offset(offset).limit(limit)).all()
    return logs

@router.get("/{workflow_id}")
def workflow_logs(workflow_id: str, limit: int = 50, db: Session = Depends(get_session)):
    logs = db.exec(
        select(AuditLog)
        .where(AuditLog.workflow_id == workflow_id)
        .order_by(AuditLog.executed_at.desc())
        .limit(limit)
    ).all()
    return logs
