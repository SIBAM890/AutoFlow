import os
import uuid
from sqlmodel import Session, select
from models import Template, Workflow

def seed_database(db: Session):
    existing_templates = db.exec(select(Template)).all()
    if not existing_templates:
        seed_templates(db)
        
    existing_workflows = db.exec(select(Workflow)).all()
    if not existing_workflows:
        seed_demo_workflows(db)

def seed_templates(db: Session):
    templates = [
        Template(id=str(uuid.uuid4()), name="Stock Query Auto-Reply", category="inventory", description="Automatically replies to stock queries from WhatsApp based on CSV data."),
        Template(id=str(uuid.uuid4()), name="Payment Reminder", category="payments", description="Reminds customers to pay overdue balances."),
        Template(id=str(uuid.uuid4()), name="Customer Broadcast", category="broadcast", description="Send announcements to your customer list."),
        Template(id=str(uuid.uuid4()), name="Order Confirmation", category="orders", description="Thanks customer for order and updates tracking."),
        Template(id=str(uuid.uuid4()), name="Udhaar Reminder", category="payments", description="Polite reminder for local udhaar books.")
    ]
    for t in templates:
        db.add(t)
    db.commit()

def seed_demo_workflows(db: Session):
    # E1 - Demo Workflow 1
    w1 = Workflow(
        id=str(uuid.uuid4()),
        name="Stock Query Auto-Reply",
        description="Demo workflow for FOSS Hack checking stock",
        is_active=True,
        nodes=[
            {
                "id": "trigger_1", "type": "trigger",
                "position": {"x": 100, "y": 200},
                "data": {"config": {"keywords": ["stock", "available", "have you got", "do you have", "sugar", "rice"]}}
            },
            {
                "id": "inventory_1", "type": "action",
                "position": {"x": 350, "y": 200},
                "data": {"action_type": "inventory_lookup", "config": {"source_id": "default"}}
            },
            {
                "id": "condition_1", "type": "condition",
                "position": {"x": 600, "y": 200},
                "data": {"config": {"field": "results.inventory_1.quantity", "operator": "greater_than", "value": "0"}}
            },
            {
                "id": "whatsapp_true", "type": "whatsapp",
                "position": {"x": 850, "y": 100},
                "data": {"config": {"to": "{{trigger.from}}", "message": "Yes! {{results.inventory_1.product}} is available. Stock: {{results.inventory_1.quantity}} units."}}
            },
            {
                "id": "whatsapp_false", "type": "whatsapp",
                "position": {"x": 850, "y": 300},
                "data": {"config": {"to": "{{trigger.from}}", "message": "Sorry, {{results.inventory_1.product}} is out of stock right now."}}
            }
        ],
        edges=[
            {"id": "e1", "source": "trigger_1", "target": "inventory_1"},
            {"id": "e2", "source": "inventory_1", "target": "condition_1"},
            {"id": "e3", "source": "condition_1", "target": "whatsapp_true", "label": "true"},
            {"id": "e4", "source": "condition_1", "target": "whatsapp_false", "label": "false"}
        ]
    )
    
    # E2 - Demo Workflow 2 (Simulated via Manual Trigger with Broadcast style action)
    w2 = Workflow(
        id=str(uuid.uuid4()),
        name="Udhaar Payment Reminder",
        description="Reminds overdue customers",
        is_active=False,
        nodes=[
            {
                "id": "trigger_2", "type": "trigger", "position": {"x": 100, "y": 200},
                "data": {"config": {"keywords": []}, "trigger_type": "manual"}
            },
            {
                "id": "action_2", "type": "action", "position": {"x": 400, "y": 200},
                "data": {"action_type": "load_udhaar_list", "config": {}}
            }
        ],
        edges=[{"id": "e_u1", "source": "trigger_2", "target": "action_2"}]
    )

    db.add(w1)
    db.add(w2)
    db.commit()
