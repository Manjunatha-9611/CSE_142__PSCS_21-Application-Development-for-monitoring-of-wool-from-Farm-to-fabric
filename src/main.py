from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import joblib
import os
import time
from typing import Optional

app = FastAPI(
    title="Wool Quality Prediction API",
    description="AI-powered wool quality assessment API with Indian grading standards",
    version="1.0.0"
)

# Enhanced CORS middleware with explicit configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001", 
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "*"  # Allow all origins for development
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=[
        "Content-Type",
        "Authorization",
        "Accept",
        "Origin",
        "X-Requested-With",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers"
    ],
    expose_headers=["*"],
    max_age=3600  # Cache preflight requests for 1 hour
)

# Performance monitoring middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    print(f"Request to {request.url.path} took {process_time:.3f}s")
    return response

# Load models and mappings with error handling
try:
    # Load Wool Type Model
    if os.path.exists('wool_type_model.pkl'):
        wool_type_model = joblib.load('wool_type_model.pkl')
        print("✓ Loaded: wool_type_model.pkl")
    else:
        wool_type_model = None
        print("Warning: wool_type_model.pkl not found, using fallback predictions")
    
    # Load Indian Grade Model
    if os.path.exists('indian_grade_model.pkl'):
        indian_grade_model = joblib.load('indian_grade_model.pkl')
        print("✓ Loaded: indian_grade_model.pkl")
    else:
        indian_grade_model = None
        print("Warning: indian_grade_model.pkl not found, using fallback predictions")
    
    if os.path.exists('category_maps.pkl'):
        cat_maps = joblib.load('category_maps.pkl')
        print("✓ Loaded: category_maps.pkl")
    else:
        cat_maps = {
            'Crimp Characteristics': {0: 'Tight', 1: 'Moderate', 2: 'Looser'},
            'Strength': {0: 'Weak', 1: 'Moderate', 2: 'High', 3: 'Very high'},
            'Elasticity': {0: 'High', 1: 'Good', 2: 'Less elastic'},
            'Fineness': {0: 'Soft and smooth', 1: 'Moderately soft', 2: 'Rougher texture'}
        }
except Exception as e:
    print(f"Error loading models: {e}")
    wool_type_model = None
    indian_grade_model = None
    cat_maps = {
        'Crimp Characteristics': {0: 'Tight', 1: 'Moderate', 2: 'Looser'},
        'Strength': {0: 'Weak', 1: 'Moderate', 2: 'High', 3: 'Very high'},
        'Elasticity': {0: 'High', 1: 'Good', 2: 'Less elastic'},
        'Fineness': {0: 'Soft and smooth', 1: 'Moderately soft', 2: 'Rougher texture'}
    }

def indian_grade(micron):
    if micron < 25:
        return "Super A"
    elif micron <= 34.4:
        return "A"
    elif micron <= 37.4:
        return "B"
    elif micron <= 40.4:
        return "C"
    else:
        return "D"

def fallback_ml_grade(micron, staple_length):
    if micron < 20 and staple_length > 80:
        return "Premium"
    elif micron < 25 and staple_length > 60:
        return "Fine"
    elif micron < 30 and staple_length > 40:
        return "Medium"
    else:
        return "Coarse"

class Features(BaseModel):
    micron: float
    stapleLength: float
    crimp: str = "Medium"
    strength: str = "Medium"
    elasticity: str = "Medium"
    fineness: str = "Medium"

@app.get("/")
def root():
    """Root endpoint - API information"""
    models_status = {
        'wool_type': wool_type_model is not None,
        'indian_grade': indian_grade_model is not None
    }
    return {
        "message": "Wool Quality Prediction API",
        "version": "2.0.0",
        "status": "online",
        "models_loaded": models_status,
        "endpoints": {
            "health": "/health",
            "predict": "/predict-quality",
            "documentation": "/docs",
            "openapi": "/openapi.json"
        },
        "description": "AI-powered dual model wool quality assessment API with Indian grading standards"
    }

@app.get("/health")
def health_check():
    """Health check endpoint with detailed status"""
    models_loaded = {
        'wool_type': wool_type_model is not None,
        'indian_grade': indian_grade_model is not None
    }
    return {
        "status": "healthy",
        "models_loaded": models_loaded,
        "model_type": "ML" if (wool_type_model is not None or indian_grade_model is not None) else "Fallback",
        "version": "2.0.0",
        "endpoints": {
            "predict": "/predict-quality",
            "health": "/health"
        }
    }

@app.options("/predict-quality")
async def predict_quality_options():
    """Handle preflight CORS requests"""
    return JSONResponse(content={"status": "ok"}, headers={
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "*"
    })

@app.post("/predict-quality")
def predict_quality(f: Features):
    """Predict wool quality based on input features"""
    try:
        # Validate inputs
        if f.micron <= 0 or f.stapleLength <= 0:
            raise HTTPException(
                status_code=400, 
                detail="Micron and staple length must be positive numbers"
            )
        
        if f.micron > 100:
            raise HTTPException(
                status_code=400,
                detail="Micron value seems unrealistic (must be <= 100)"
            )
        
        print(f"Received prediction request: micron={f.micron}, stapleLength={f.stapleLength}")
        
        # Always compute Indian grade from micron (deterministic)
        indian = indian_grade(f.micron)
        
        # Prepare feature vector for ML models
        # Find reverse mapping (value -> key)
        def get_cat_code(cat_name, value):
            """Get categorical code for a value"""
            cat_dict = cat_maps.get(cat_name, {})
            # Reverse the mapping: find key for value
            for code, cat_value in cat_dict.items():
                if cat_value == value:
                    return code
            # Default to middle value if not found
            return 1
        
        crimp_val = get_cat_code('Crimp Characteristics', f.crimp)
        strength_val = get_cat_code('Strength', f.strength)
        elasticity_val = get_cat_code('Elasticity', f.elasticity)
        fineness_val = get_cat_code('Fineness', f.fineness)
        
        x = [f.micron, f.stapleLength, crimp_val, strength_val, elasticity_val, fineness_val]
        
        # Predict wool type
        if wool_type_model is not None:
            wool_type_prediction = wool_type_model.predict([x])[0]
            print(f"Wool Type ML prediction: {wool_type_prediction}")
        else:
            # Fallback wool type prediction
            wool_type_prediction = fallback_ml_grade(f.micron, f.stapleLength)
            print(f"Using fallback wool type prediction: {wool_type_prediction}")
        
        # Predict indian grade using ML model (if available)
        if indian_grade_model is not None:
            indian_ml_prediction = indian_grade_model.predict([x])[0]
            print(f"Indian Grade ML prediction: {indian_ml_prediction}")
            # Use ML prediction if model is available
            indian_final = indian_ml_prediction
        else:
            # Use deterministic calculation as fallback
            indian_final = indian
            print(f"Using deterministic Indian Grade: {indian_final}")
        
        result = {
            "success": True,
            "wool_type": wool_type_prediction,
            "indian_grade": indian_final,
            "ml_grade": wool_type_prediction,  # For backward compatibility
            "model_used": "ML" if (wool_type_model is not None or indian_grade_model is not None) else "Fallback",
            "input_features": {
                "micron": f.micron,
                "stapleLength": f.stapleLength,
                "crimp": f.crimp,
                "strength": f.strength,
                "elasticity": f.elasticity,
                "fineness": f.fineness
            }
        }
        
        print(f"Returning result: {result}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Prediction error: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail={
                "error": "Prediction failed",
                "message": str(e),
                "type": type(e).__name__
            }
        )
