from sqlmodel import SQLModel, Field
from sqlalchemy import Column, JSON
from typing import Optional, Dict, List, Any
from datetime import datetime

class Workflow(SQLModel, table=True):
    __tablename__ = "workflows"
    id: str = Field(primary_key=True)
    name: str
    description: Optional[str] = None
    nl_input: Optional[str] = None
    nodes: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    edges: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    is_active: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Template(SQLModel, table=True):
    __tablename__ = "templates"
    id: str = Field(primary_key=True)
    name: str
    description: Optional[str] = None
    category: Optional[str] = None # 'orders', 'payments', 'inventory', 'broadcast'
    nodes: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    edges: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    use_count: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AuditLog(SQLModel, table=True):
    __tablename__ = "audit_logs"
    id: str = Field(primary_key=True)
    workflow_id: Optional[str] = Field(default=None, foreign_key="workflows.id")
    workflow_name: Optional[str] = None
    trigger_type: Optional[str] = None # 'whatsapp', 'schedule', 'manual'
    trigger_data: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    actions_taken: Optional[List[Dict[str, Any]]] = Field(default=None, sa_column=Column(JSON))
    result: Optional[str] = None # 'success', 'failed', 'skipped'
    error_message: Optional[str] = None
    executed_at: datetime = Field(default_factory=datetime.utcnow)

class InventorySource(SQLModel, table=True):
    __tablename__ = "inventory_sources"
    id: str = Field(primary_key=True)
    name: str
    type: Optional[str] = None # 'csv', 'google_sheets'
    file_path: Optional[str] = None
    sheet_url: Optional[str] = None
    last_synced: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
