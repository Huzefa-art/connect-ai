# app/api/v1/routes/chatbot.py
from fastapi import APIRouter, UploadFile, File, Form,Request,HTTPException
import logging

from fastapi.responses import JSONResponse
from backend.schemas.chatbot import chatbotdata, ConntectPlatformData, WorkflowPayload,AIModel
import json
import getpass
import os
import hashlib

from langchain.chat_models import init_chat_model
from langchain_openai import OpenAIEmbeddings
from langchain_huggingface import HuggingFaceEmbeddings

from langchain_core.vectorstores import InMemoryVectorStore
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain import hub
from dotenv import load_dotenv
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableParallel, RunnablePassthrough
from langchain_ollama.llms import OllamaLLM
from typing import Dict, List, Tuple, Any
from langchain_core.prompts import ChatPromptTemplate
import asyncio

load_dotenv()
# api_key = os.getenv("OPENAI_API_KEY")
# if not api_key:
#     raise ValueError("OPENAI_API_KEY not found in environment variables")

logging.basicConfig(
    level=logging.INFO,
    filename='app.log',  
    filemode='w',        
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


router = APIRouter()

llm: any = None
embeddings: any = None
vectorstore: InMemoryVectorStore = None
existing_hashes = set()
reasoning = False
workflow_config: Dict[str, List[Tuple[str, Any, Tuple[str, str]]]] = {
    "platform": [],
    "ai":       [],
    "document": []
}
teacherPrompt = """
You are an Teacher for question-answering tasks, Use two sentences maximum and keep the answer concise.
Question: {question} 
Answer:
"""
rag_prompt = """
You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.
Question: {question} 
Context: {context}
Answer:
"""
@router.on_event("startup")
async def startup_event():
    global available_llms, embeddings, vectorstore, reasoning

    logger.info("Starting the FastAPI application...")

    logger.info("Initializing language models...")
    available_llms = ["qwen2.5:0.5b"]
    # llm = init_chat_model("gpt-4o-mini", model_provider="openai")
    # model_names = ["deepseek-r1:1.5b","qwen2.5:0.5b"]
    # using_model = model_names[1]
    # llm = OllamaLLM(model=using_model)
    # if "deepseek" in using_model:
    #     reasoning = True

    # logger.info("Loading HuggingFace embeddings model...")
    # embeddings = HuggingFaceEmbeddings(
    #     model_name="sentence-transformers/all-mpnet-base-v2",
    #     model_kwargs={"device": "cpu"},
    #     encode_kwargs={"normalize_embeddings": False},
    # )

    # logger.info("Initializing InMemory vector store...")
    # vectorstore = InMemoryVectorStore.from_documents([], embeddings)
    logger.info("FastAPI application started and services are initialized.")
def set_llm(provider,modelname):
    if provider == "OllamaLLM":
        return OllamaLLM(model=modelname)
    
        # return provider + modelname

async def handle_platform(node, input_data):
    question = input_data["question"]
    return {"question":question}

    # print(f"[Platform] {node['name']} → passing input")
    # return f" this is my handle platform {node['name']}'{input_data}'"

async def handle_llm(node, input_data):
    global rag_prompt, teacherPrompt , available_llms

    question = input_data["question"]
    provider = input_data["provider"]
    model_name = input_data["modelname"]
    if model_name not in available_llms:
        return {"question":question, "answer":f"MODEL {model_name} NOT available."}
    llm = set_llm(provider,model_name)
    print("-------",llm)
    output_parser = StrOutputParser()
    if "vector_store" in input_data:
        prompt = ChatPromptTemplate.from_template(rag_prompt)
        setup_and_retrieval = input_data["vector_store"]
        chain = setup_and_retrieval | prompt | llm | output_parser
        output = chain.invoke(question)
        return {"vector_store":setup_and_retrieval,"question":question, "answer":output}

    else:
        prompt = ChatPromptTemplate.from_template(teacherPrompt)
        chain = prompt  | llm  |  output_parser
        output = chain.invoke(question)
        return {"question":question, "answer":output}



    # print(f"[LLM] {node['name']} → prompt: {node['prompt']}")
    # return f" this is my handle llm {node['name']}'{input_data}'"

async def handle_document(node, input_data):
    question = input_data["question"]

    setup_and_retrieval,question=load_docs(question)
    return {"vector_store":setup_and_retrieval,"question":question}
    
    # print(f"[Document] Generating: {node['name']}")
    # return f"this is my document{node['name']}'{input_data}"

async def run_workflow(user_input):
    global workflow_config, HANDLERS
    output = user_input
    if all(len(steps) == 0 for steps in workflow_config.values()):
        return "Please set workflow configuration"
 

    # Build node lookup from workflow_config
    node_lookup = {
        node_id: {
            "bucket": bucket,
            "name": name,
            "provider":provider,
            "prompt": prompt,
            "next": next_id
        }
        for bucket, items in workflow_config.items()
        for node_id, name,provider,prompt, next_id in items
    }

    # Start from the first platform node
    if not workflow_config["platform"]:
        return {"error": "No platform node found"}

    current_node_id = workflow_config["platform"][0][0]
    start_node_id = workflow_config["platform"][0][0]

    while current_node_id:
        node = node_lookup[current_node_id]
        handler = HANDLERS[node["bucket"]]
        print(node["provider"],node["name"])
        output["provider"] = node["provider"]
        output["modelname"] = node["name"]
        output = await handler(node, output)
        current_node_id = node["next"]
        if current_node_id == start_node_id:
            break
    print("my final ouput-----",output)
    if "answer" in output:
        return output["answer"]
    else:
        return "Sorry got no answer"

HANDLERS = {
    "platform": handle_platform,
    "ai": handle_llm,
    "document": handle_document
}
def classify(node_id: str) -> str:
    """
    Simple heuristic: anything with id 'ai-...' is AI,
    'platform-...' or the special 'user-node' is platform,
    'doc-...' is document. Tweak as you need.
    """
    if node_id.startswith("ai-"):
        return "ai"
    if node_id.startswith("platform-") or node_id == "user-node":
        return "platform"
    if node_id.startswith("doc-"):
        return "document"
    # fallback to platform
    return "platform"


def compute_hash(content: bytes) -> str:
    return hashlib.sha256(content).hexdigest()

def load_docs(question: str):
    global vectorstore
    # print(vectorstore)
    # top_docs = vectorstore.similarity_search(question, k=2)
    retriever = vectorstore.as_retriever()
    setup_and_retrieval = RunnableParallel(
        {"context": retriever, "question": RunnablePassthrough()}
    )
    return setup_and_retrieval, question
# def load_LLM():
#     global LLM
#     chain = setup_and_retrieval | prompt | llm | output_parser
#     output = chain.invoke(question)

# def load_LLM(question: str):
#     global vectorstore, llm
#     # print(vectorstore)
#     # top_docs = vectorstore.similarity_search(question, k=2)
#     retriever = vectorstore.as_retriever()

#     rag_prompt = """
#     You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.
#     Question: {question} 
#     Context: {context}
#     Answer:
#     """

#     prompt = ChatPromptTemplate.from_template(rag_prompt)
#     output_parser = StrOutputParser()

#     setup_and_retrieval = RunnableParallel(
#         {"context": retriever, "question": RunnablePassthrough()}
#     )
#     # print(setup_and_retrieval)
#     chain = setup_and_retrieval | prompt | llm | output_parser
#     output = chain.invoke(question)
#     return output

# chat response
# @router.post("/get_response")
# async def get_response(data: chatbotdata):
#     global reasoning
#     answer = load_LLM(data.msg)
#     print(reasoning)
#     if reasoning:
#         start_tag = "<think>"
#         end_tag = "</think>"
#         think_part = answer.split(start_tag)[1].split(end_tag)[0].strip()
#         output_part = answer.split(end_tag)[1].strip()

#         return { "response": f"{output_part}" }

    
#     return {"response": answer}
@router.post("/get_response")
async def get_response(data: chatbotdata):
    user_question = {"question":data.msg}

    return {"response": await run_workflow(user_question)}

# upload documents
@router.post("/upload")
async def upload_doc(file: UploadFile = File(...)):
    global vectorstore, existing_hashes
    contents = await file.read()

    doc_hash = compute_hash(contents)
    if doc_hash in existing_hashes:
        print("Duplicate document detected. Skipping addition into vector database.")
        return JSONResponse(
            content={"filename": file.filename, "message": "Duplicate document detected."},
            status_code=400
        )
        
    temp_file_path = f"temp_{file.filename}"
    with open(temp_file_path, "wb") as f:
        f.write(contents)
    try:
        loader = PyPDFLoader(temp_file_path)
        pages = loader.load()

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            add_start_index=True,
        )
        splits = splitter.split_documents(pages)
        vectorstore.add_documents(splits)

        existing_hashes.add(doc_hash)

        return JSONResponse(content={"filename": file.filename, "message": "Document uploaded and processed successfully."})

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred while processing the document: {str(e)}")
    finally:
        # Clean up the temporary file
        os.remove(temp_file_path)

# @router.post("/set-workflow")
# async def set_workflow(payload: WorkflowPayload):
#     # Print the received payload to see the structure
#     print("Received workflow:", payload.workflow)
#     print("Received nodes:", payload.nodes)

#     return {"message": "Workflow received successfully!"}

# set workflow
@router.post("/set-workflow")
async def set_workflow(payload: WorkflowPayload):
    global workflow_config
    print("Received workflow:", payload.workflow)
    print("Received nodes:", payload.nodes)

    # 1) lookup by node-name
    node_by_name = { n.name: n for n in payload.nodes }

    # 2) clear old config
    for bucket in workflow_config:
        workflow_config[bucket].clear()

    # 3) for each edge, store (id, name, prompt, next_id)
    for edge in payload.workflow:
        frm = node_by_name[edge.from_]
        to  = node_by_name[edge.to]

        bucket = classify(frm.id)
        if bucket == "ai":
            workflow_config[bucket].append((
                frm.id,
                frm.name,
                frm.provider,
                frm.systemPrompt,
                to.id
            ))
        else:
            workflow_config[bucket].append((
                frm.id,
                frm.name,
                None,
                None,
                to.id
            ))

    print("Built workflow_config:", workflow_config)
    return {
        "message": "Workflow received successfully!",
        "config":  workflow_config
    }
#save models 
@router.post("/save-ai-model")
async def save_ai_model(model: AIModel):
    print(model)
    return {"message": "AI Model saved successfully", "model": model}


@router.post("/connect-platform")
async def connect_platform(data: ConntectPlatformData):
    print("Received platform connection data:", data)
    print(type(data.webhook_url))
    response_data = {
        "platform": data.platform,
        "api_key": data.api_key,
        "webhook_url": data.webhook_url  
    }

    return JSONResponse(content={"message": "Platform connected successfully!", "data": response_data})
