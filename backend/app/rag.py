# """
# RAG implementation using Chroma + sentence-transformers.

# This version:
# - Uses Chroma for vector storage and retrieval
# - Uses sentence-transformers for embedding generation
# - Loads financial data at startup
# - Loads persisted CSV files into vector store
# - Resets collection on startup to avoid duplicate embeddings
# """
# # consider following steps and rewrite rag.py keeping only essentials
# # Step 1. Load CSV files
# # Step 2. Create Chunmks


# from typing import List, Dict, Any
# import logging
# import os
# import csv

# import chromadb
# from sentence_transformers import SentenceTransformer

# logger = logging.getLogger(__name__)


# # -----------------------------
# # Chroma Document Store
# # -----------------------------

# class ChromaDocStore:
#     def __init__(self, collection_name: str = "budget_assist_docs"):
#         self.client = chromadb.Client()
#         self.collection_name = collection_name
#         self.model = SentenceTransformer("all-MiniLM-L6-v2")

#         # Reset collection on startup (avoid duplicates)
#         try:
#             self.client.delete_collection(collection_name)
#             logger.info("Deleted existing Chroma collection: %s", collection_name)
#         except Exception:
#             pass

#         self.collection = self.client.create_collection(collection_name)
#         logger.info("Initialized Chroma collection: %s", collection_name)

#     def add_document(self, doc_id: str, text: str, metadata: Dict[str, Any] = None):
#         if metadata is None:
#             metadata = {}

#         embedding = self.model.encode(text).tolist()

#         self.collection.add(
#             ids=[doc_id],
#             documents=[text],
#             metadatas=[metadata],
#             embeddings=[embedding]
#         )

#     def retrieve(self, query: str, k: int = 3) -> List[Dict[str, Any]]:
#         query_embedding = self.model.encode(query).tolist()

#         results = self.collection.query(
#             query_embeddings=[query_embedding],
#             n_results=k
#         )

#         documents = results.get("documents", [[]])[0]
#         ids = results.get("ids", [[]])[0]
#         metadatas = results.get("metadatas", [[]])[0]

#         output = []
#         for i, doc_text in enumerate(documents):
#             output.append({
#                 "id": ids[i],
#                 "text": doc_text,
#                 "metadata": metadatas[i]
#             })

#         return output


# # Global store instance
# _DOC_STORE = ChromaDocStore()


# # -----------------------------
# # Core RAG Functions
# # -----------------------------

# def add_documents(docs: List[Dict[str, Any]]):
#     for d in docs:
#         _DOC_STORE.add_document(
#             d.get("id"),
#             d.get("text"),
#             d.get("metadata")
#         )


# def retrieve_context(query: str, k: int = 3) -> List[Dict[str, Any]]:
#     return _DOC_STORE.retrieve(query, k=k)


# def format_context_for_prompt(documents: List[Dict[str, Any]]) -> str:
#     if not documents:
#         return ""
#     return "\n".join([f"- {doc.get('text', '')}" for doc in documents])


# def retrieve_and_format_context(query: str, k: int = 3) -> tuple[str, List[str]]:
#     docs = retrieve_context(query, k=k)
#     context_str = format_context_for_prompt(docs)
#     doc_ids = [d.get("id") for d in docs]
#     return context_str, doc_ids


# # -----------------------------
# # CSV Loading
# # -----------------------------

# def load_csv_files_into_rag(csv_directory: str):
#     """
#     Load all CSV files from directory into RAG.
#     Each row becomes a document.
#     """
#     if not os.path.exists(csv_directory):
#         logger.warning("CSV directory not found: %s", csv_directory)
#         return

#     logger.info("Loading CSV files from %s", csv_directory)

#     docs_to_add = []

#     for filename in os.listdir(csv_directory):
#         if not filename.endswith(".csv"):
#             continue

#         file_path = os.path.join(csv_directory, filename)

#         try:
#             with open(file_path, newline="", encoding="utf-8") as csvfile:
#                 reader = csv.DictReader(csvfile)

#                 for idx, row in enumerate(reader):
#                     row_text = ". ".join(
#                         [f"{key}: {value}" for key, value in row.items()]
#                     )

#                     text = f"Data from CSV file '{filename}'. {row_text}"

#                     docs_to_add.append({
#                         "id": f"{filename}_row_{idx}",
#                         "text": text,
#                         "metadata": {
#                             "type": "csv_row",
#                             "source_file": filename,
#                             "row_index": idx
#                         }
#                     })

#         except Exception as e:
#             logger.error("Failed loading CSV file %s: %s", filename, e)

#     if docs_to_add:
#         add_documents(docs_to_add)
#         logger.info("Loaded %d CSV rows into RAG", len(docs_to_add))


# # -----------------------------
# # Initialization
# # -----------------------------

# def initialize_with_financial_data():
#     """
#     Populate RAG with:
#     - Budgets
#     - Goals
#     - Financial summary
#     - Persisted CSV files
#     """

#     from app import storage

#     logger.info("Initializing RAG...")

#     docs_to_add = []

#     # Budgets
#     for budget in storage.budgets:
#         docs_to_add.append({
#             "id": f"budget_{budget.id}",
#             "text": (
#                 f"Budget: {budget.name}. "
#                 f"Monthly limit: ${budget.monthly_limit}. "
#                 f"Alert threshold: {budget.alert_threshold * 100:.0f}%."
#             ),
#             "metadata": {"type": "budget"}
#         })

#     # Goals
#     for goal in storage.goals:
#         progress = 0
#         if goal.target_amount:
#             progress = goal.saved_amount / goal.target_amount * 100

#         docs_to_add.append({
#             "id": f"goal_{goal.id}",
#             "text": (
#                 f"Goal: {goal.name}. "
#                 f"Target amount: ${goal.target_amount}. "
#                 f"Currently saved: ${goal.saved_amount}. "
#                 f"Progress: {progress:.0f}%."
#             ),
#             "metadata": {"type": "goal"}
#         })

#     # Financial Summary
#     summary = storage.get_financial_summary()
#     docs_to_add.append({
#         "id": "summary_current",
#         "text": (
#             f"Financial summary. "
#             f"Total income: ${summary.total_income}. "
#             f"Total expenses: ${summary.total_expense}. "
#             f"Balance: ${summary.total_balance}. "
#             f"Transactions count: {summary.transactions_count}."
#         ),
#         "metadata": {"type": "summary"}
#     })

#     if docs_to_add:
#         add_documents(docs_to_add)
#         logger.info("Loaded %d financial documents", len(docs_to_add))

#     # Load CSV files
#     load_csv_files_into_rag("./data")


# def sync_financial_data():
#     logger.info("Syncing financial data to RAG...")
#     initialize_with_financial_data()