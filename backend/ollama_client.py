import os
import json
import httpx
import asyncio
from typing import Dict, Any

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")

SYSTEM_PROMPT = """
You are AutoFlow, an AI that converts business automation requests into structured workflow JSON.

You have access to these node types:
- trigger: whatsapp_message, schedule, manual
- action: inventory_lookup, send_whatsapp, send_broadcast, log_payment, check_udhaar
- condition: compare, contains_text, time_check
- whatsapp: send_whatsapp (outbound message with template variables)
- delay: wait_seconds, wait_until

Rules:
1. Always start with exactly ONE trigger node
2. Always end with at least one action node
3. Use {{variable}} syntax for dynamic values
4. Position nodes left-to-right with x incrementing by 200, y centered at 200
5. Return ONLY valid JSON matching the workflow schema. No explanation, no markdown.
"""

USER_PROMPT = """
Business automation request: "{nl_input}"

Generate a complete workflow JSON with nodes and edges.
Use node positions that make visual sense left-to-right.
"""

STRICT_PROMPT = """
You failed to generate valid JSON last time.
This time, you MUST output ONLY a valid, parseable JSON object.
Do NOT use markdown code blocks (```json).
Start your response with { and end with }.
Do not include any other conversational text.

Business automation request: "{nl_input}"
"""

EXPLAINER_PROMPT = """
Given this workflow JSON, explain in simple plain English what this automation does.
Write it as if explaining to a non-technical shop owner in India.
Maximum 4 sentences. Start with "This automation..."
"""

async def generate_workflow(nl_input: str, is_retry: bool = False) -> Dict[str, Any]:
    prompt = STRICT_PROMPT.format(nl_input=nl_input) if is_retry else USER_PROMPT.format(nl_input=nl_input)
    
    for attempt in range(3):
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{OLLAMA_URL}/api/chat",
                    json={
                        "model": "qwen3:8b",
                        "messages": [
                            {"role": "system", "content": SYSTEM_PROMPT},
                            {"role": "user", "content": prompt}
                        ],
                        "stream": False,
                        "options": {
                            "temperature": 0.1 if is_retry else 0.2, # Lower temp on retry
                            "num_predict": 2048
                        }
                    },
                    timeout=60.0
                )
                response.raise_for_status()
                raw = response.json().get("message", {}).get("content", "")
                
                # Clean JSON markdown blocks
                clean = raw.strip()
                if clean.startswith("```json"):
                    clean = clean[7:]
                elif clean.startswith("```"):
                    clean = clean[3:]
                if clean.endswith("```"):
                    clean = clean[:-3]
                    
                clean = clean.strip()
                return json.loads(clean)
                
        except (httpx.RequestError, httpx.HTTPStatusError) as e:
            if attempt == 2:
                raise Exception(f"Ollama connection failed after 3 attempts: {str(e)}")
            await asyncio.sleep(2)
            
        except json.JSONDecodeError as e:
            if not is_retry:
                # Retry once with stricter prompt
                return await generate_workflow(nl_input, is_retry=True)
            raise Exception(f"Failed to generate valid JSON: {str(e)}\nRaw output: {raw[:100]}...")

async def explain_workflow(workflow_json: Dict[str, Any]) -> str:
    for attempt in range(3):
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{OLLAMA_URL}/api/chat",
                    json={
                        "model": "qwen3:8b",
                        "messages": [
                            {"role": "system", "content": EXPLAINER_PROMPT},
                            {"role": "user", "content": f"Workflow JSON:\n{json.dumps(workflow_json)}"}
                        ],
                        "stream": False,
                        "options": {
                            "temperature": 0.3,
                            "num_predict": 512
                        }
                    },
                    timeout=30.0
                )
                response.raise_for_status()
                raw = response.json().get("message", {}).get("content", "")
                return raw.strip()
        except (httpx.RequestError, httpx.HTTPStatusError) as e:
            if attempt == 2:
                raise Exception(f"Ollama connection failed after 3 attempts: {str(e)}")
            await asyncio.sleep(2)

