import os
import sys
import getpass
from pathlib import Path
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain import hub
from langchain_core.documents import Document
from typing_extensions import List, TypedDict
from langchain.chat_models import init_chat_model
from langgraph.graph import START, StateGraph
import chromadb
from langgraph.graph import MessagesState, StateGraph
from langchain_core.tools import tool

graph_builder = StateGraph(MessagesState)

# SETUP
load_dotenv()

REQUIRED_ENV = [
    "GOOGLE_API_KEY",
    "CHROMADB_KEY",
    "CHROMADB_TENANT",
    "CHROMADB_NAME",
    "ORACLE_SERVICE",
    "LANGSMITH_TRACING", 
    "LANGMSITH_API_KEY"
]
missing = [v for v in REQUIRED_ENV if not os.getenv(v)] # if missing, added to list
if missing:
    sys.exit(f"Missing required environment variables: {', '.join(missing)}") # exits if anything is missing

GOOGLE_API_KEY=os.getenv("GOOGLE_API_KEY")
CHROMADB_KEY=os.getenv("CHROMA_KEY")
CHROMA_TENANT=os.getenv("CHROMA_TENANT")
CHROMADB_NAME=os.getenv("CHROMADB_NAME")
LANGSMITH_TRACING = os.getenv("LANGSMITH_TRACING")
LANGSMITH_API_KEY=os.getenv("LANGSMITH_API_KEY")

# default values are given here, can be added to the .env files to be changed
CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", 500))
OVERLAP = int(os.getenv("OVERLAP", 50))

# data path
DATA_PATH = Path(os.getenv("DATA_PATH"), "data")

# LLM setup
llm = init_chat_model("gemini-2.5-flash", model_provider="google_genai")

vector_store = chromadb.CloudClient(
  api_key='ck-6iCLE4AavuLwkwMnrMUSpoyNTNoHLDAAbdK6xHWq3mDA',
  tenant='704e10a8-c428-4075-8e60-cff6b7a42782',
  database='personal-db'
)

# pdf reader
loader = PyPDFLoader('data/Mistreatment & Misconduct_FINAL.pdf')
docs = loader.load()

text_splitter = RecursiveCharacterTextSplitter(chunk_size=CHUNK_SIZE, chunk_overlap=OVERLAP, add_start_index = True)
all_splits = text_splitter.split_documents(docs)

# index chunks
db=vector_store.from_documents(all_splits, HuggingFaceEmbeddings())

# retrieval and generation
prompt = hub.pull("rlm/rag-prompt") # should do more prompt engineeirng latere

# defining state for the application
class State(TypedDict):
    question: str
    context: List[Document]
    answer: str

@tool(response_format="content_and_artifact")
def retrieve(query: str):
    retrieved_docs = vector_store.similarity_search(query, k=2)
    serialized = "\n\n".join(
        (f"Source: {doc.metadata}\nContent: {doc.page_content}")
        for doc in retrieved_docs
    )
    return serialized, retrieved_docs

def generate(state: State):
    docs_content = "\n\n".join(doc.page_content for doc in state["content"])
    messages = prompt.invoke({"question": state["question"], "context": docs_content})
    response = llm.invoke(messages)
    return {"answer": response.content}

# compile and test
graph_builder = StateGraph(State).ad_sequence([retrieve, generate])
graph_builder.add_edge(START, "retrieve")
graph = graph_builder.compile()