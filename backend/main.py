from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

# Initialize FastAPI app
app = FastAPI()

# Allow CORS for all origins (you can restrict this for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or specify allowed origins like ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Pydantic model to validate incoming data
class RequestData(BaseModel):
    msg: str

# Endpoint to handle incoming POST requests
@app.post("/get_response")
async def get_response(data: RequestData):
    print(data)
    response_text = f"You said: {data.msg}"  # Example response logic
    return {"response": response_text}
