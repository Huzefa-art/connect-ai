# app/api/v1/routes/chatbot.py
from fastapi import APIRouter, UploadFile, File, Form,Request

from fastapi.responses import JSONResponse
from backend.schemas.chatbot import chatbotdata, ConntectPlatformData, WorkflowPayload,AIModel
import json

router = APIRouter()

# chat response
@router.post("/get_response")
async def get_response(data: chatbotdata):
    print(data)
    response_text = f"You said: {data.msg}"
    return {"response": response_text}


# upload documents
@router.post("/upload")
async def upload_doc(file: UploadFile = File(...)):
    contents = await file.read()
    
    print(f"Received file: {file.filename}, size: {len(contents)} bytes")

    return JSONResponse(content={"filename": file.filename})

# set workflow
@router.post("/set-workflow")
async def set_workflow(payload: WorkflowPayload):
    # Print the received payload to see the structure
    print("Received workflow:", payload.workflow)
    print("Received nodes:", payload.nodes)


    return {"message": "Workflow received successfully!"}

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
