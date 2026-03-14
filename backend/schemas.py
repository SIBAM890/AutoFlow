from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class NodePosition(BaseModel):
    x: float
    y: float

class WorkflowNode(BaseModel):
    id: str
    type: str
    position: NodePosition
    data: Dict[str, Any]

class WorkflowEdge(BaseModel):
    id: str
    source: str
    target: str
    label: Optional[str] = None

class WorkflowSchema(BaseModel):
    id: Optional[str] = None
    name: str
    description: Optional[str] = None
    nl_input: Optional[str] = None
    nodes: List[WorkflowNode]
    edges: List[WorkflowEdge]

class WorkflowGenerateRequest(BaseModel):
    nl_input: str
