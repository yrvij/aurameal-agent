import os
import sys
import logging
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv

# Secure secret management
# Load environment variables from .env file
load_dotenv()

# Import agent orchestrator
from agent_engine import AuraAgentOrchestrator, DB_FILE

PORT = int(os.environ.get("ANTIGRAVITY_SIDECAR_WEB_PORT", 8080))
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

app = FastAPI(title="AuraMeal API Server")

# Initialize orchestrator
orchestrator = AuraAgentOrchestrator()

# Define request schemas
class ChatRequest(BaseModel):
    message: str
    conversation_id: str
    profile: dict

# API Endpoints
@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    """Processes chat request through the agent engine asynchronously."""
    response = await orchestrator.invoke_async(
        message=req.message,
        conversation_id=req.conversation_id,
        profile=req.profile
    )
    return JSONResponse(content=response)

@app.get("/api/health")
async def health_endpoint():
    """Confirms API Key status and database setup."""
    api_key_loaded = bool(os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY"))
    db_ok = os.path.exists(DB_FILE)
    return JSONResponse(content={
        "status": "healthy",
        "api_key_configured": api_key_loaded,
        "database_exists": db_ok,
        "port": PORT
    })

@app.get("/api/logs")
async def logs_endpoint():
    """Retrieves SQLite persistent execution logs for observability."""
    import sqlite3
    try:
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute("SELECT timestamp, component, action, details FROM execution_logs ORDER BY id DESC LIMIT 50")
        rows = c.fetchall()
        conn.close()
        
        logs = [{"timestamp": r[0], "component": r[1], "action": r[2], "details": r[3]} for r in rows]
        return JSONResponse(content={"status": "success", "logs": logs})
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})

# Mount static files at root
app.mount("/static", StaticFiles(directory=DIRECTORY), name="static")

@app.get("/")
async def serve_index():
    """Serves the index.html page."""
    with open(os.path.join(DIRECTORY, "index.html"), "r") as f:
        html_content = f.read()
    return HTMLResponse(content=html_content)

if __name__ == "__main__":
    print(f"Starting FastAPI server on port {PORT}...")
    # Run uvicorn server
    uvicorn.run(app, host="0.0.0.0", port=PORT)
