# AutoFlow OSS Testing Checklist

## 🏗️ Start up
- [ ] `docker-compose up --build` runs without throwing terminal errors.
- [ ] Container `ollama` successfully pulls the `qwen3:8b` model implicitly. (Wait ~1min)
- [ ] Container `whatsapp-bridge` logs `WhatsApp Bridge running on port 3001` and generates a QR code.

## 🟢 Endpoints & Health
- [ ] Navigate to `http://localhost:8000/docs` to see the FastAPI Swagger UI.
- [ ] Navigate to `http://localhost:3000` to see the React Frontend wrapper.
- [ ] Run `curl http://localhost:3001/status` and receive JSON `{ "connected": false }` (or true if registered).

## 🛠️ Feature Testing
- [ ] **AI Generation**: On Frontend Builder, type "When user asks about order, check tracking" and see valid ReactFlow nodes render in UI.
- [ ] **SQLite Seeding**: `backend/data/autoflow.db` exists.
- [ ] **Data Read**: Ensure hitting `GET /api/templates` on Swagger returns the 5 default demo templates.

## 📱 Demo 1: Stock Query E2E
- [ ] Go to WhatsApp and scan the QR printed by docker-compose logs for `whatsapp-bridge`.
- [ ] Turn ON the `Stock Query Auto-Reply` inside `Builder` top bar (Set to Active).
- [ ] Send message from another phone: *"Do you have any sugar left?"*
- [ ] Backends should log standard trigger matching keywords: `sugar`.
- [ ] `executor.py` runs `inventory_lookup`. It loads `inventory.csv` mapped locally.
- [ ] Automated reply is sent back: *"Sorry, sugar is out of stock right now."* (Qty is 0 in CSV).
- [ ] Message *"What about rice?"* -> Returns *"Yes! rice is available. Stock: 50 units."*
- [ ] Verify execution is logged in SQLite `audit_logs` table (Viewable via `GET /api/audit`).

## ✅ Conclusion
If all above pass, AutoFlow OSS offline core architecture is completely functional.
