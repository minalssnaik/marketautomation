import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import AsyncOpenAI
from typing import Optional

# Initialize FastAPI app
app = FastAPI(
    title="Marketing Automation API",
    description="AI-powered marketing workflow automation backend for content generation, trend analysis, and engagement insights.",
    version="1.0.0"
)

# Enable CORS for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client
client = AsyncOpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

# -------------------- MODELS --------------------
class ContentParams(BaseModel):
    brand: str
    platform: str
    goals: Optional[str] = None
    personas: Optional[str] = None
    emerging_trends: Optional[str] = None


# -------------------- ROUTES --------------------
@app.get("/")
async def root():
    return {"message": "🚀 Marketing Automation API is running successfully!"}


@app.post("/generate-content/")
async def generate_ai_content(params: ContentParams):
    """
    Generate AI-driven content ideas and recommendations
    based on brand context, audience, and emerging trends.
    """
    try:
        # Build the context prompt for AI
        context = f"""
        You are a viral social media marketing strategist specialized in jewelry brands.
        Generate highly engaging and actionable content ideas and captions tailored for {params.platform}.
        
        Brand: {params.brand}
        Marketing Goals: {params.goals}
        Target Personas: {params.personas}
        Emerging Trends: {params.emerging_trends}
        
        Provide the output in JSON format:
        {{
            "strategy_summary": "Short overview of suggested strategy",
            "post_ideas": [
                {{
                    "caption": "text",
                    "hashtags": ["#tag1", "#tag2"],
                    "media_suggestion": "type of image/video to use"
                }}
            ],
            "recommendations": [
                "short actionable tip 1",
                "short actionable tip 2"
            ]
        }}
        """

        # Send prompt to OpenAI
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert marketing strategist for jewelry brands."},
                {"role": "user", "content": context}
            ],
            temperature=0.7
        )

        ai_output = response.choices[0].message.content.strip()
        return {"status": "success", "ai_output": ai_output}

    except Exception as e:
        print("❌ Error generating AI content:", e)
        raise HTTPException(status_code=500, detail=str(e))


# -------------------- RUN LOCALLY --------------------
# For local testing: uvicorn backend.server:app --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.server:app", host="0.0.0.0", port=8000, reload=True)
