import os
import httpx
import asyncio
from typing import Dict, Any, List
from collections import defaultdict
import re
from uuid import uuid4
from datetime import datetime

from sqlmodel import Session
from models import AuditLog

WHATSAPP_BRIDGE_URL = os.getenv("WHATSAPP_BRIDGE_URL", "http://whatsapp-bridge:3001")

class WorkflowExecutor:
    """
    Executes a workflow graph node by node.
    Starting from the trigger node, traverses edges,
    evaluates conditions, and fires actions.
    """

    def __init__(self, db_session: Session):
        self.db = db_session

    async def execute(self, workflow_id: str, workflow_name: str, workflow_json: dict, trigger_type: str, trigger_data: dict):
        nodes = {n["id"]: n for n in workflow_json["nodes"]}
        edges = workflow_json["edges"]
        
        # Find trigger node (always starts execution)
        try:
            trigger_node = next(n for n in workflow_json["nodes"] if n["type"] == "trigger")
        except StopIteration:
            await self._log_audit(workflow_id, workflow_name, trigger_type, trigger_data, [], "failed", "No trigger node found")
            return

        # Build adjacency map
        next_nodes = defaultdict(list)
        for edge in edges:
            next_nodes[edge["source"]].append({
                "target": edge["target"],
                "label": edge.get("label")  # "true"/"false" for conditions
            })
        
        context = {"trigger": trigger_data, "results": {}}
        actions_taken = []
        
        try:
            await self._execute_node(trigger_node, nodes, next_nodes, context, actions_taken)
            await self._log_audit(workflow_id, workflow_name, trigger_type, trigger_data, actions_taken, "success", None)
        except Exception as e:
            await self._log_audit(workflow_id, workflow_name, trigger_type, trigger_data, actions_taken, "failed", str(e))


    async def _execute_node(self, node: dict, nodes: dict, next_nodes: dict, context: dict, actions_taken: List[dict]):
        node_type = node["type"]
        node_data = node.get("data", {})
        
        actions_taken.append({
            "node_id": node["id"],
            "type": node_type,
            "label": node_data.get("label", "Unknown"),
            "executed_at": datetime.utcnow().isoformat()
        })
        
        if node_type == "action":
            result = await self._run_action(node_data, context)
            context["results"][node["id"]] = result
            
        elif node_type == "condition":
            result = await self._evaluate_condition(node_data, context)
            # Only follow the matching branch (true/false edge)
            for edge in next_nodes[node["id"]]:
                if edge["label"] and edge["label"].lower() == str(result).lower():
                    await self._execute_node(nodes[edge["target"]], nodes, next_nodes, context, actions_taken)
            return
            
        elif node_type == "whatsapp":
            await self._send_whatsapp(node_data.get("config", {}), context)
            
        elif node_type == "delay":
            config = node_data.get("config", {})
            wait_time = int(config.get("wait_seconds", 0))
            await asyncio.sleep(wait_time)
        
        # Continue to next nodes
        for edge in next_nodes[node["id"]]:
            if not edge.get("label"):  # unconditional edge
                await self._execute_node(nodes[edge["target"]], nodes, next_nodes, context, actions_taken)

    async def _run_action(self, node_data: dict, context: dict) -> Any:
        action_type = node_data.get("action_type")
        config = node_data.get("config", {})
        
        if action_type == "inventory_lookup":
            # Dummy logic until CSV inventory is implemented
            return {"quantity": 10}
            
        elif action_type == "log_payment":
            return {"status": "logged"}
            
        elif action_type == "send_whatsapp" or action_type == "send_broadcast":
            await self._send_whatsapp(config, context)
            return {"status": "sent"}
            
        return None

    async def _evaluate_condition(self, node_data: dict, context: dict) -> bool:
        condition_type = node_data.get("condition_type")
        config = node_data.get("config", {})
        
        field = config.get("field")
        operator = config.get("operator")
        value = config.get("value")
        
        actual_value = self._resolve_template(f"{{{{{field}}}}}", context)
        
        # Super basic string evaluation logic for now
        if operator == "greater_than":
            try:
                return float(actual_value) > float(value)
            except:
                return False
        elif operator == "equals":
            return str(actual_value).lower() == str(value).lower()
        elif operator == "contains":
            return str(value).lower() in str(actual_value).lower()
            
        return False

    async def _send_whatsapp(self, config: dict, context: dict):
        message_template = config.get("message", "")
        to_template = config.get("to", "")
        
        message = self._resolve_template(message_template, context)
        to_number = self._resolve_template(to_template, context)
        
        if not to_number:
            raise Exception("Missing 'to' number for WhatsApp message")
            
        # Call the nodejs bridge
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{WHATSAPP_BRIDGE_URL}/send",
                json={
                    "to": to_number,
                    "message": message
                },
                timeout=10.0
            )
            response.raise_for_status()

    def _resolve_template(self, text: str, context: dict) -> str:
        """
        Replaces {{trigger.from}} or {{inventory.quantity}} or {{results.node_X.status}} with actual values.
        """
        if not text or not isinstance(text, str):
            return text
            
        def replacer(match):
            path = match.group(1).split('.')
            value = context
            try:
                for key in path:
                    # Very simple lookup logic
                    if isinstance(value, dict):
                         value = value.get(key, "")
                    else:
                         return ""
                return str(value)
            except Exception:
                return ""
                
        return re.sub(r'\{\{([\w\.]+)\}\}', replacer, text)
        
    async def _log_audit(self, workflow_id: str, workflow_name: str, trigger_type: str, trigger_data: dict, actions_taken: List[dict], result: str, error_message: str = None):
        log = AuditLog(
            id=str(uuid4()),
            workflow_id=workflow_id,
            workflow_name=workflow_name,
            trigger_type=trigger_type,
            trigger_data=trigger_data,
            actions_taken=actions_taken,
            result=result,
            error_message=error_message
        )
        self.db.add(log)
        self.db.commit()
