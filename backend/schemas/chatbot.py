# app/schemas/chatbot.py
from pydantic import BaseModel,HttpUrl, Field
from typing import List, Optional

#chat message
class chatbotdata(BaseModel):
    msg: str


class WorkflowEdge(BaseModel):
    from_: str = Field(..., alias='from')  
    to: str

    class Config:
        populate_by_name = True

class WorkflowNode(BaseModel):
    id: str
    name: str
    provider: Optional[str] = None
    systemPrompt: Optional[str] = None

class WorkflowPayload(BaseModel):
    workflow: List[WorkflowEdge]
    nodes: List[WorkflowNode]

#save ai model
class AIModel(BaseModel):
    modelName: str
    provider: str
    apiKey: str
    promptTemplate: str

class ConnectPlatformData(BaseModel):
    platform: str
    api_key: str
    webhook_url: str
