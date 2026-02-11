# Quick Test Commands - Date-Based System

## The Simplest Test (Just 3 Commands)

### Test 1: First message
```bash
curl -X POST http://localhost:8000/api/v1/chat/ \
  -H "Content-Type: application/json" \
  -d '{"message": "I spent 100 dollars on groceries"}'
```

### Test 2: Follow-up (no session ID needed!)
```bash
curl -X POST http://localhost:8000/api/v1/chat/ \
  -H "Content-Type: application/json" \
  -d '{"message": "How much did I spend?"}'
```

**Expected:** Agent should mention the $100 from Test 1

### Test 3: View the file
```bash
cat backend/app/user_data/conversations/$(date +%Y-%m-%d).md
```

**Expected:** Single markdown file with both messages

---

## More Test Scenarios

### Add Multiple Transactions
```bash
curl -X POST http://localhost:8000/api/v1/chat/ \
  -H "Content-Type: application/json" \
  -d '{"message": "I spent 50 on utilities"}'

curl -X POST http://localhost:8000/api/v1/chat/ \
  -H "Content-Type: application/json" \
  -d '{"message": "Add 25 for coffee"}'

curl -X POST http://localhost:8000/api/v1/chat/ \
  -H "Content-Type: application/json" \
  -d '{"message": "How much have I spent in total?"}'
```

### Check Budget Status
```bash
curl -X POST http://localhost:8000/api/v1/chat/ \
  -H "Content-Type: application/json" \
  -d '{"message": "What is my budget status?"}'
```

### Can I Afford?
```bash
curl -X POST http://localhost:8000/api/v1/chat/ \
  -H "Content-Type: application/json" \
  -d '{"message": "Can I spend 500 on groceries?"}'
```

### Goal Questions
```bash
curl -X POST http://localhost:8000/api/v1/chat/ \
  -H "Content-Type: application/json" \
  -d '{"message": "How am I doing with my savings goals?"}'
```

---

## Verify Full Day Context Works

Run this batch to test full context sharing:

```bash
#!/bin/bash

TODAY=$(date +%Y-%m-%d)
FILE="backend/app/user_data/conversations/$TODAY.md"

echo "=== Testing Date-Based Context System ==="
echo "Today's file: $FILE"
echo ""

# Message 1
echo "[1] Adding grocery expense..."
curl -s -X POST http://localhost:8000/api/v1/chat/ \
  -H "Content-Type: application/json" \
  -d '{"message": "I spent 100 on groceries"}' | jq '.response'

# Message 2 - References Message 1
echo ""
echo "[2] Asking about spending (should reference groceries)..."
curl -s -X POST http://localhost:8000/api/v1/chat/ \
  -H "Content-Type: application/json" \
  -d '{"message": "How much on groceries?"}' | jq '.response'

# Message 3 - References Messages 1 & 2
echo ""
echo "[3] Adding utilities (should have full context)..."
curl -s -X POST http://localhost:8000/api/v1/chat/ \
  -H "Content-Type: application/json" \
  -d '{"message": "Add 50 on utilities"}' | jq '.response'

# Message 4 - References all previous
echo ""
echo "[4] Total spending (should know about groceries AND utilities)..."
curl -s -X POST http://localhost:8000/api/v1/chat/ \
  -H "Content-Type: application/json" \
  -d '{"message": "What have I spent in total?"}' | jq '.response'

echo ""
echo "=== Conversation File ==="
echo "File location: $FILE"
echo ""
if [ -f "$FILE" ]; then
  echo "✓ File exists!"
  echo ""
  echo "Content:"
  cat "$FILE"
else
  echo "✗ File not found"
fi
```

Save as `test_date_system.sh` and run:
```bash
chmod +x test_date_system.sh
./test_date_system.sh
```

---

## Check File Organization

### List all conversation files
```bash
ls -lh backend/app/user_data/conversations/
```

### Count messages per day
```bash
echo "Today's message count:"
grep "👤\|🤖" backend/app/user_data/conversations/$(date +%Y-%m-%d).md | wc -l
```

### View latest conversations
```bash
tail -50 backend/app/user_data/conversations/$(date +%Y-%m-%d).md
```

### Check yesterday's file (if exists)
```bash
YESTERDAY=$(date -d "1 day ago" +%Y-%m-%d)
cat "backend/app/user_data/conversations/$YESTERDAY.md"
```

---

## Verify Context Persistence

### Message sequence that tests context:
```bash
# 1. Set up a budget scenario
curl -s -X POST http://localhost:8000/api/v1/chat/ \
  -H "Content-Type: application/json" \
  -d '{"message": "I have a 300 dollar grocery budget"}' | jq '.response'

# 2. Add spending
curl -s -X POST http://localhost:8000/api/v1/chat/ \
  -H "Content-Type: application/json" \
  -d '{"message": "I spent 150 on groceries"}' | jq '.response'

# 3. Ask about affordability with full context
curl -s -X POST http://localhost:8000/api/v1/chat/ \
  -H "Content-Type: application/json" \
  -d '{"message": "Can I afford to spend 200 more?"}' | jq '.response'
```

**Expected Response to Message 3:**
- Agent remembers $300 budget from message 1
- Agent remembers $150 spent from message 2
- Agent calculates: $300 - $150 = $150 remaining
- Agent says "No, you can only afford $150 more"

---

## API Response Format (Simplified)

Request:
```json
{
  "message": "I spent 100 on groceries"
}
```

Response:
```json
{
  "response": "Added transaction: $100 spent on groceries",
  "timestamp": "2026-02-10T14:23:46.123456",
  "tool": "add_transaction",
  "tool_result": {"ok": true, "transaction": {...}},
  "intent": {
    "intent": "add_transaction",
    "entities": {"amount": 100, "category": "groceries"}
  },
  "context_used": null
}
```

**No more session_id!** Just message and response.

---

## What Changed from Session System

| Aspect | Session System | Date System |
|--------|---|---|
| Client Request | `{"message": "...", "session_id": "..."}` | `{"message": "..."}` |
| File per | Session (user must manage) | Day (system manages) |
| File naming | UUIDs | YYYY-MM-DD |
| Agent context | Last 10 turns | Full day |
| Server restart | State lost | Loads from disk |
| Next day | Same file continues | New file starts |

---

## Troubleshooting

**File not created?**
```bash
ls -la backend/app/user_data/conversations/
```

**File exists but empty?**
```bash
wc -l backend/app/user_data/conversations/$(date +%Y-%m-%d).md
```

**Can't see context in responses?**
Check that `conversation_history` is passed to agent:
```bash
grep -n "conversation_history" backend/app/routes/chat.py
```

**Messages not accumulating?**
Verify file is being updated:
```bash
tail -f backend/app/user_data/conversations/$(date +%Y-%m-%d).md
```

---

## That's It!

Testing is now even simpler:
- No session IDs to manage
- Just send messages
- Agent automatically has full context
- One file per day
- Files organized by date

Enjoy! 🎉
