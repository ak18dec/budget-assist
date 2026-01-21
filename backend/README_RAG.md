# RAG Prototype Notes

This prototype implements a minimal Retrieval-Augmented-Generation (RAG) stack.

`app/rag.py` now supports two backends:

- Chroma + `sentence-transformers` (preferred if installed) — vector embeddings + nearest-neighbor search.
- In-memory token-set fallback — Jaccard similarity on token sets when Chroma or embeddings are unavailable.

Usage:

```bash
# add docs
curl -X POST "http://localhost:8000/api/v1/rag/docs/add" -H "Content-Type: application/json" -d '[{"id":"doc1","text":"Your monthly rent is due on the 1st."}]'

# retrieve
curl "http://localhost:8000/api/v1/rag/docs/retrieve?q=rent"
```
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



Notes:
- To use the Chroma backend, install dependencies from `requirements.txt` and ensure `chromadb` and `sentence-transformers` are available.
- The included model is `all-MiniLM-L6-v2` from `sentence-transformers` (downloaded automatically).
- For production embedding providers and vector DBs, consider OpenAI embeddings + managed vector DB (Pinecone/Weaviate/Chroma with persistence).
