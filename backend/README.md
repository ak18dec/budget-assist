# budget-assist backend

This folder contains a beginner-friendly FastAPI backend scaffold with:

- `app/main.py` - FastAPI application and router wiring
- `app/models.py` - Pydantic models
- `app/storage.py` - simple in-memory storage (lists, helpers)
- `app/routes/*` - API routes for transactions, budgets, goals, summary, and chat
- `app/agents/` - empty agents package (for future tooling)

To run locally:

```bash
python -m pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Use Cases

BudgetAI should show alerts/insights as following:
- Your outgoings are high this month. We predict you won't have enough to cover your upcoming bills payment tomorrow. As agreed we will transfer money from your low priority savings pot to your spendings pot to make the payment
- You've exceeded your 20% entertainment budget for this month. To cover the cost of. coffee you just bought, we'll automatically use funds from your holiday savings pot as previously agreed
- Your cash balance in your spending pot, fell below 100 INR three times in the past 6 months [Spending Insights]
- Keep warm this Winter, Your energy bill is likely to inc by about 10% [Bills Insights]
- Your monthly water bill is upcoming but there is insufficient funds in your spending pot. We have moved the funds from your savings pot to ensure there is enough to cover this payment
- Your spending is on track this month, and you're nearing your 1500 INR goal
- Your internet bill inc by 8 INR this month
- We've noticed you've recently changed TV suppliers and now have 2 Netflix subscriptions. Would you like to cancel one of the accounts
- You've spent 125 INR on subscriptions this month, 45 INR over your goal spend in this category. Your Starbucks coffee subscription, a monthly payment of 100 INR renews tomorrow. Do you still wants this?


Test Statements:
 - Add 250 groceries today
 - Add 120 coffee
 - Show my transactions
 - Show my budgets
 - How am I doing this month?
 - Are my goals on track?
 - move extra money to savings
 - can I add 5k to vacation?
 - consent-based auto-allocation
 - proper financial health analysis
 - got refund 1200
 - add bonus 10000 to vacation goal