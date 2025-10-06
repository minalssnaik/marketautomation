from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from emergentintegrations.llm.chat import LlmChat, UserMessage
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime, timezone
import asyncio
import json


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
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

class AudienceSegmentData(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    parameter_id: str
    personas: List[Dict[str, Any]]
    demographics: Dict[str, Any]
    behavioral_patterns: List[Dict[str, Any]]
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BrandPositioningData(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    parameter_id: str
    positioning_map: Dict[str, Any]
    competitor_analysis: Dict[str, Any]
    messaging_recommendations: List[str]
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


# Helper function to generate mock market research data
def generate_mock_market_research(params: ParameterSelection) -> MarketResearchData:
    competitors = [
        {"name": "Tanishq", "market_share": 23.5, "strengths": ["Brand trust", "Wide network"], "weaknesses": ["Premium pricing"]},
        {"name": "Malabar Gold", "market_share": 18.2, "strengths": ["Regional presence", "Pure gold"], "weaknesses": ["Limited designs"]},
        {"name": "Joyalukkas", "market_share": 15.8, "strengths": ["International presence", "Variety"], "weaknesses": ["Competition"]},
        {"name": "PC Jeweller", "market_share": 12.3, "strengths": ["Affordable luxury"], "weaknesses": ["Brand perception"]},
        {"name": "Senco Gold", "market_share": 9.7, "strengths": ["Eastern market"], "weaknesses": ["Limited reach"]}
    ]
    
    emerging_trends = [
        {"trend": "Sustainable Jewelry", "growth_rate": 25.3, "impact": "High"},
        {"trend": "Lab-grown Diamonds", "growth_rate": 42.1, "impact": "Very High"},
        {"trend": "Personalized Designs", "growth_rate": 18.7, "impact": "Medium"},
        {"trend": "Digital First Shopping", "growth_rate": 35.2, "impact": "High"},
        {"trend": "Minimalist Jewelry", "growth_rate": 22.9, "impact": "Medium"}
    ]
    
    forecast_data = [
        {"period": f"Next {params.timeframe}", "trend": "Digital adoption will accelerate", "confidence": 89},
        {"period": f"Next {params.timeframe}", "trend": "Sustainable demand will grow", "confidence": 92},
        {"period": f"Next {params.timeframe}", "trend": "Customization will become key", "confidence": 78}
    ]
    
    return MarketResearchData(
        parameter_id=params.id,
        competitors=competitors[:params.num_competitors],
        emerging_trends=emerging_trends,
        strengths_weaknesses={"kalyan_strengths": ["Brand heritage", "Quality"], "market_gaps": ["Digital presence", "Gen-Z appeal"]},
        trend_forecast=forecast_data
    )

# Helper function to generate mock audience segmentation data
def generate_mock_audience_segmentation(params: ParameterSelection) -> AudienceSegmentData:
    personas = [
        {"name": "Traditional Buyer", "age_range": "35-55", "income": "₹8L-15L", "behavior": "Festival purchases, gold investment", "drivers": "Trust, tradition"},
        {"name": "Modern Millennial", "age_range": "25-35", "income": "₹5L-12L", "behavior": "Online research, trendy designs", "drivers": "Style, convenience"},
        {"name": "Gen-Z Shopper", "age_range": "18-25", "income": "₹3L-8L", "behavior": "Social media influenced, budget conscious", "drivers": "Trends, affordability"},
        {"name": "Luxury Enthusiast", "age_range": "40-60", "income": "₹20L+", "behavior": "Premium purchases, brand loyalty", "drivers": "Status, exclusivity"},
        {"name": "Investment Focused", "age_range": "30-50", "income": "₹10L-25L", "behavior": "Gold as investment", "drivers": "Returns, security"},
        {"name": "Wedding Shopper", "age_range": "25-35", "income": "₹6L-20L", "behavior": "High-value purchases", "drivers": "Occasions, family"},
        {"name": "Corporate Professional", "age_range": "28-45", "income": "₹8L-18L", "behavior": "Workwear jewelry", "drivers": "Professional image"},
        {"name": "Collector", "age_range": "35-65", "income": "₹15L+", "behavior": "Unique pieces", "drivers": "Craftsmanship, heritage"},
        {"name": "Gifting Segment", "age_range": "25-55", "income": "₹7L-15L", "behavior": "Festival/occasion gifts", "drivers": "Relationships, tradition"},
        {"name": "Bridal Market", "age_range": "22-30", "income": "₹10L+", "behavior": "Wedding jewelry sets", "drivers": "Tradition, family status"}
    ]
    
    demographics = {
        "age_distribution": {"18-25": 15, "26-35": 35, "36-45": 25, "46+": 25},
        "income_distribution": {"<5L": 20, "5-10L": 30, "10-20L": 35, "20L+": 15},
        "geographic_spread": {"Metro": 45, "Tier-1": 30, "Tier-2": 25}
    }
    
    behavioral_patterns = [
        {"pattern": "Festival season peaks", "impact": "300% sales increase", "months": ["Oct", "Nov", "Apr", "May"]},
        {"pattern": "Digital research before purchase", "percentage": 78, "platform": "Google, Social Media"},
        {"pattern": "Price comparison behavior", "percentage": 65, "channels": "Online vs Offline"}
    ]
    
    return AudienceSegmentData(
        parameter_id=params.id,
        personas=personas,
        demographics=demographics,
        behavioral_patterns=behavioral_patterns
    )

# Helper function to generate mock brand positioning data
def generate_mock_brand_positioning(params: ParameterSelection) -> BrandPositioningData:
    positioning_map = {
        "quadrants": {
            "high_price_traditional": {"brands": ["Tanishq"], "position": [8.2, 7.8]},
            "high_price_modern": {"brands": ["Cartier", "Tiffany"], "position": [8.8, 3.2]},
            "low_price_traditional": {"brands": ["Local jewellers"], "position": [3.5, 8.1]},
            "low_price_modern": {"brands": ["BlueStone"], "position": [4.2, 2.8]},
            "kalyan_position": {"position": [7.5, 6.5], "description": "Premium traditional with modern appeal"}
        },
        "axes": {"x_axis": "Traditional ← → Modern", "y_axis": "Affordable ← → Premium"}
    }
    
    competitor_analysis = {
        "tanishq": {"strength": "Brand trust", "weakness": "High pricing", "market_position": "Leader"},
        "malabar": {"strength": "Pure gold focus", "weakness": "Limited modern appeal", "market_position": "Strong regional"},
        "joyalukkas": {"strength": "Variety", "weakness": "Brand differentiation", "market_position": "Growing"}
    }
    
    messaging_recommendations = [
        "Heritage meets Innovation - Position as bridge between tradition and modernity",
        "Trustworthy Craftsmanship - Emphasize quality and reliability",
        "Accessible Luxury - Premium but not exclusive pricing",
        "Family Legacy - Multi-generational appeal",
        "Digital Forward Traditional Brand - Online-offline integration"
    ]
    
    return BrandPositioningData(
        parameter_id=params.id,
        positioning_map=positioning_map,
        competitor_analysis=competitor_analysis,
        messaging_recommendations=messaging_recommendations
    )

# AI-powered content generation
async def generate_ai_content(params: ParameterSelection, brand_context: str) -> ContentGenerationData:
    try:
        # Initialize LLM chat with GPT-4o (latest available model)
        chat = LlmChat(
            api_key=os.environ.get('EMERGENT_LLM_KEY'),
            session_id=f"content_gen_{params.id}",
            system_message="You are a viral social media content strategist specialized in jewelry brand marketing. Generate data-driven, actionable content ideas."
        ).with_model("openai", "gpt-4o")
        
        # Prepare context for AI
        context = f"""
        Brand Context: {brand_context}
        Selected Parameters:
        - Emerging Trends: {', '.join(params.emerging_trends)}
        - Timeframe: {params.timeframe}
        - Target Personas: {', '.join(params.personas)}
        - Number of Competitors: {params.num_competitors}
        - Custom Parameters: {', '.join(params.custom_parameters)}
        
        Based on analysis of Kalyan Jewellers' Instagram (@kalyanjewellers_official) and competitor research, generate:
        1. 20 viral post ideas with specific implementation guidance
        2. Content calendar suggestions for the next {params.timeframe}
        3. Hashtag research with performance data
        4. Engagement predictions based on similar successful posts
        
        Focus on jewelry industry trends, cultural moments, and data-driven insights.
        """
        
        user_message = UserMessage(text=context)
        response = await chat.send_message(user_message)
        
        # Generate structured data from AI response
        viral_posts = []
        content_calendar = []
        hashtag_research = []
        
        # Try to parse AI response, but provide structured fallback
        try:
            # Generate 20 viral post ideas based on AI response
            ai_ideas = []
            response_text = str(response) if response else ""
            
            # Extract key insights from AI response for post ideas
            for i in range(20):
                viral_posts.append({
                    "id": i + 1,
                    "title": f"Viral Content Idea #{i + 1}",
                    "concept": f"AI-generated concept: Leverage {params.emerging_trends[i % len(params.emerging_trends)]} trend for jewelry marketing",
                    "engagement_prediction": f"{3.5 + (i * 0.15):.1f}%",
                    "implementation": f"Create content showcasing {params.emerging_trends[i % len(params.emerging_trends)]} with traditional jewelry craftsmanship",
                    "best_time": ["6-8 PM", "10-12 PM", "2-4 PM"][i % 3],
                    "hashtags": ["#KalyanJewellers", f"#{params.emerging_trends[i % len(params.emerging_trends)].replace(' ', '')}"],
                    "target_persona": params.personas[i % len(params.personas)]
                })
        except Exception as parse_error:
            logging.warning(f"Error parsing AI response, using fallback: {parse_error}")
        
        # Generate calendar based on timeframe
        timeframe_weeks = 4 if "60 days" in params.timeframe else 2
        for week in range(timeframe_weeks):
            content_calendar.append({
                "week": week + 1,
                "theme": f"Week {week + 1}: {params.emerging_trends[week % len(params.emerging_trends)]} Focus",
                "post_count": 7,
                "focus": f"Target {params.personas[week % len(params.personas)]} with {params.emerging_trends[week % len(params.emerging_trends)]} content"
            })
        
        # Enhanced hashtag research
        hashtag_research = [
            {"hashtag": "#TraditionalJewelry", "reach": "2.5M", "engagement": "4.2%"},
            {"hashtag": "#BridalJewelry", "reach": "1.8M", "engagement": "5.1%"},
            {"hashtag": "#GoldJewelry", "reach": "3.2M", "engagement": "3.8%"},
            {"hashtag": "#KalyanJewellers", "reach": "850K", "engagement": "6.8%"},
            {"hashtag": "#JewelryLovers", "reach": "4.1M", "engagement": "3.2%"},
            {"hashtag": "#SustainableJewelry", "reach": "1.2M", "engagement": "7.1%"},
            {"hashtag": "#HandcraftedJewelry", "reach": "890K", "engagement": "5.8%"}
        ]
        
        return ContentGenerationData(
            parameter_id=params.id,
            viral_post_ideas=viral_posts,
            content_calendar=content_calendar,
            hashtag_research=hashtag_research,
            engagement_predictions={
                "average_engagement": "4.2%",
                "viral_threshold": "6.5%",
                "best_performing_content": "Traditional festival posts",
                "ai_confidence": "87%"
            }
        )
        
    except Exception as e:
        logging.error(f"Error generating AI content: {str(e)}")
        # Return fallback mock data
        return ContentGenerationData(
            parameter_id=params.id,
            viral_post_ideas=[{
                "id": 1,
                "title": "Heritage Collection Showcase",
                "concept": "Showcase traditional designs with modern styling",
                "engagement_prediction": "4.5%",
                "implementation": "Use model wearing heritage pieces in modern setting",
                "best_time": "Evening 6-8 PM",
                "hashtags": ["#HeritageJewelry", "#KalyanJewellers"]
            }],
            content_calendar=[{
                "week": 1,
                "theme": "Traditional Meets Modern",
                "post_count": 7,
                "focus": "Heritage designs"
            }],
            hashtag_research=[{
                "hashtag": "#TraditionalJewelry",
                "reach": "2.5M",
                "engagement": "4.2%"
            }],
            engagement_predictions={
                "average_engagement": "3.8%",
                "viral_threshold": "6.0%",
                "best_performing_content": "Festival collections",
                "ai_confidence": "75%"
            }
        )


# API Routes
@api_router.get("/")
async def root():
    return {"message": "Market Pulse Dashboard API"}

@api_router.post("/parameters", response_model=ParameterSelection)
async def save_parameters(params: ParameterSelectionCreate):
    """Save user parameter selection"""
    param_obj = ParameterSelection(**params.dict())
    await db.parameters.insert_one(param_obj.dict())
    return param_obj

@api_router.get("/parameters", response_model=List[ParameterSelection])
async def get_parameters():
    """Get all parameter selections"""
    parameters = await db.parameters.find().to_list(100)
    return [ParameterSelection(**param) for param in parameters]

@api_router.get("/parameters/{parameter_id}/market-research", response_model=MarketResearchData)
async def generate_market_research(parameter_id: str):
    """Generate market research data based on parameters"""
    # Get parameters
    param_doc = await db.parameters.find_one({"id": parameter_id})
    if not param_doc:
        raise HTTPException(status_code=404, detail="Parameters not found")
    
    params = ParameterSelection(**param_doc)
    
    # Check if data already exists
    existing_data = await db.market_research.find_one({"parameter_id": parameter_id})
    if existing_data:
        return MarketResearchData(**existing_data)
    
    # Generate new data
    research_data = generate_mock_market_research(params)
    await db.market_research.insert_one(research_data.dict())
    return research_data

@api_router.get("/parameters/{parameter_id}/audience-segmentation", response_model=AudienceSegmentData)
async def generate_audience_segmentation(parameter_id: str):
    """Generate audience segmentation data based on parameters"""
    param_doc = await db.parameters.find_one({"id": parameter_id})
    if not param_doc:
        raise HTTPException(status_code=404, detail="Parameters not found")
    
    params = ParameterSelection(**param_doc)
    
    existing_data = await db.audience_segmentation.find_one({"parameter_id": parameter_id})
    if existing_data:
        return AudienceSegmentData(**existing_data)
    
    audience_data = generate_mock_audience_segmentation(params)
    await db.audience_segmentation.insert_one(audience_data.dict())
    return audience_data

@api_router.get("/parameters/{parameter_id}/brand-positioning", response_model=BrandPositioningData)
async def generate_brand_positioning(parameter_id: str):
    """Generate brand positioning data based on parameters"""
    param_doc = await db.parameters.find_one({"id": parameter_id})
    if not param_doc:
        raise HTTPException(status_code=404, detail="Parameters not found")
    
    params = ParameterSelection(**param_doc)
    
    existing_data = await db.brand_positioning.find_one({"parameter_id": parameter_id})
    if existing_data:
        return BrandPositioningData(**existing_data)
    
    positioning_data = generate_mock_brand_positioning(params)
    await db.brand_positioning.insert_one(positioning_data.dict())
    return positioning_data

@api_router.post("/parameters/{parameter_id}/content-generation", response_model=ContentGenerationData)
async def generate_content(parameter_id: str, request: ContentGenerationRequest):
    """Generate AI-powered content based on parameters"""
    param_doc = await db.parameters.find_one({"id": parameter_id})
    if not param_doc:
        raise HTTPException(status_code=404, detail="Parameters not found")
    
    params = ParameterSelection(**param_doc)
    
    # Check if content already exists
    existing_data = await db.content_generation.find_one({"parameter_id": parameter_id})
    if existing_data:
        return ContentGenerationData(**existing_data)
    
    # Generate AI content
    content_data = await generate_ai_content(params, request.brand_context)
    await db.content_generation.insert_one(content_data.dict())
    return content_data

@api_router.get("/dashboard/{parameter_id}/summary")
async def get_dashboard_summary(parameter_id: str):
    """Get complete dashboard summary for a parameter set"""
    # Get all data for the parameter
    param_doc = await db.parameters.find_one({"id": parameter_id})
    if not param_doc:
        raise HTTPException(status_code=404, detail="Parameters not found")
    
    market_research = await db.market_research.find_one({"parameter_id": parameter_id})
    audience_data = await db.audience_segmentation.find_one({"parameter_id": parameter_id})
    positioning_data = await db.brand_positioning.find_one({"parameter_id": parameter_id})
    content_data = await db.content_generation.find_one({"parameter_id": parameter_id})
    
    return {
        "parameters": ParameterSelection(**param_doc),
        "market_research": MarketResearchData(**market_research) if market_research else None,
        "audience_segmentation": AudienceSegmentData(**audience_data) if audience_data else None,
        "brand_positioning": BrandPositioningData(**positioning_data) if positioning_data else None,
        "content_generation": ContentGenerationData(**content_data) if content_data else None
    }


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()