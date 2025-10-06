import os
import logging
import uuid
import asyncio
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Dict, Any
from dotenv import load_dotenv
from fastapi import FastAPI, APIRouter, HTTPException
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from openai import AsyncOpenAI

# ---------------------------------------------------------
# ✅ Load environment variables (works for local & Streamlit)
# ---------------------------------------------------------
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# ---------------------------------------------------------
# ✅ Setup logging
# ---------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------
# ✅ Environment variable validation
# ---------------------------------------------------------
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "marketing_db")

if not OPENAI_API_KEY:
    raise ValueError("❌ OPENAI_API_KEY not found. Please set it in Streamlit Secrets or .env file.")
if not MONGO_URL:
    raise ValueError("❌ MONGO_URL not found. Please set it in Streamlit Secrets or .env file.")

# ---------------------------------------------------------
# ✅ Initialize OpenAI client
# ---------------------------------------------------------
try:
    openai_client = AsyncOpenAI(api_key=OPENAI_API_KEY)
    logger.info("✅ OpenAI client initialized successfully.")
except Exception as e:
    logger.error(f"❌ Failed to initialize OpenAI client: {e}")
    raise

# ---------------------------------------------------------
# ✅ MongoDB connection
# ---------------------------------------------------------
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# ---------------------------------------------------------
# ✅ FastAPI initialization
# ---------------------------------------------------------
app = FastAPI(title="Market Pulse Automation Backend")
api_router = APIRouter(prefix="/api")

# ---------------------------------------------------------
# ✅ Data Models
# ---------------------------------------------------------
class ParameterSelection(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    emerging_trends: List[str]
    timeframe: str
    personas: List[str]
    num_competitors: int
    custom_parameters: List[str]
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ParameterSelectionCreate(BaseModel):
    emerging_trends: List[str]
    timeframe: str
    personas: List[str]
    num_competitors: int
    custom_parameters: List[str] = []


class MarketResearchData(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    parameter_id: str
    competitors: List[Dict[str, Any]]
    emerging_trends: List[Dict[str, Any]]
    strengths_weaknesses: Dict[str, Any]
    trend_forecast: List[Dict[str, Any]]
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ContentGenerationRequest(BaseModel):
    parameter_id: str
    brand_context: str = "Kalyan Jewellers - Premium jewelry brand focusing on traditional and contemporary designs"
    content_type: str = "viral_posts"


class ContentGenerationData(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    parameter_id: str
    viral_post_ideas: List[Dict[str, Any]]
    content_calendar: List[Dict[str, Any]]
    hashtag_research: List[Dict[str, Any]]
    engagement_predictions: Dict[str, Any]
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ---------------------------------------------------------
# ✅ Helper: AI-powered content generation
# ---------------------------------------------------------
async def generate_ai_content(params: ParameterSelection, brand_context: str) -> ContentGenerationData:
    try:
        logger.info("🚀 Generating AI-powered content using GPT-4o...")

        context = f"""
        You are a social media strategist for jewelry brands.
        Generate a viral content plan for:
        Brand: {brand_context}
        Trends: {', '.join(params.emerging_trends)}
        Personas: {', '.join(params.personas)}
        Timeframe: {params.timeframe}
        """

        response = await openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are an expert jewelry marketing strategist."},
                {"role": "user", "content": context}
            ],
            temperature=0.8,
            max_tokens=600
        )

        ai_text = response.choices[0].message.content.strip()

        # Return structured mock + AI mix
        viral_posts = [
            {"id": 1, "title": "Heritage Revival Campaign", "concept": ai_text[:150], "engagement_prediction": "4.5%"}
        ]

        content_calendar = [
            {"week": 1, "theme": "Modern Tradition Fusion", "post_count": 7}
        ]

        hashtag_research = [
            {"hashtag": "#KalyanJewellers", "reach": "850K", "engagement": "6.8%"}
        ]

        return ContentGenerationData(
            parameter_id=params.id,
            viral_post_ideas=viral_posts,
            content_calendar=content_calendar,
            hashtag_research=hashtag_research,
            engagement_predictions={
                "average_engagement": "4.2%",
                "viral_threshold": "6.5%",
                "ai_summary": ai_text[:500]
            }
        )

    except Exception as e:
        logger.error(f"AI content generation failed: {e}")
        return ContentGenerationData(
            parameter_id=params.id,
            viral_post_ideas=[{"id": 1, "title": "Fallback Idea", "concept": "Elegant traditional showcase", "engagement_prediction": "3.5%"}],
            content_calendar=[{"week": 1, "theme": "Fallback Campaign", "post_count": 3}],
            hashtag_research=[{"hashtag": "#FallbackJewelry", "reach": "100K", "engagement": "3.0%"}],
            engagement_predictions={"average_engagement": "3.0%", "ai_confidence": "Low"}
        )

# ---------------------------------------------------------
# ✅ API Routes
# ---------------------------------------------------------
@api_router.get("/")
async def root():
    return {"message": "Market Pulse Automation API is running!"}


@api_router.post("/parameters", response_model=ParameterSelection)
async def save_parameters(params: ParameterSelectionCreate):
    param_obj = ParameterSelection(**params.dict())
    await db.parameters.insert_one(param_obj.dict())
    return param_obj


@api_router.post("/content/{parameter_id}", response_model=ContentGenerationData)
async def create_content(parameter_id: str, request: ContentGenerationRequest):
    param_doc = await db.parameters.find_one({"id": parameter_id})
    if not param_doc:
        raise HTTPException(status_code=404, detail="Parameters not found")

    params = ParameterSelection(**param_doc)
    content_data = await generate_ai_content(params, request.brand_context)
    await db.content_generation.insert_one(content_data.dict())
    return content_data

# ---------------------------------------------------------
# ✅ Include router and middleware
# ---------------------------------------------------------
app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# ✅ Cleanup on shutdown
# ---------------------------------------------------------
@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
    logger.info("MongoDB connection closed.")
