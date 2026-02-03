from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import numpy as np
import joblib
import os
import pymysql
from sqlalchemy import create_engine, text

app = FastAPI(title="AI Pricing & Recs Demo")

MODELS_DIR = "models"
PRICING_MODEL_PATH = os.path.join(MODELS_DIR, "pricing_model.joblib")

pricing_info = None

# Global variable for the recommender model
recommender = None

@app.on_event("startup")
async def startup_event():
    global pricing_info, recommender
    
    # Load pricing model (already there)
    if os.path.exists(PRICING_MODEL_PATH):
        pricing_info = joblib.load(PRICING_MODEL_PATH)
        print("✅ Pricing model loaded!")
    else:
        print("❌ Pricing model not found!")

    # Load recommendation model
    RECOMMENDER_MODEL_PATH = os.path.join(MODELS_DIR, "recommender_model.joblib")
    if os.path.exists(RECOMMENDER_MODEL_PATH):
        recommender = joblib.load(RECOMMENDER_MODEL_PATH)
        print("✅ Recommender (SVD) model loaded!")
    else:
        print("❌ Recommender model not found! You need to train it in Colab again.")

        # Replace get_db_connection() with this

def get_db_engine():
    # Adjust username, password, db name
        return create_engine(
            "mysql+pymysql://root:mysql@localhost/adaptive_ecom?charset=utf8mb4"
        )

# Recommendation endpoint
@app.get("/recommend")
def recommend(user_id: int, n: int = 6):
    if recommender is None:
        return {"error": "Recommender model not loaded. Train and save it in Colab first."}

    predictions = []
    # Assuming products are numbered 1 to 25 (from your Colab training)
    for pid in range(1, 26):
        pred = recommender.predict(user_id, pid)
        predictions.append((pid, pred.est))

    # Sort by predicted rating (highest first)
    top_n = sorted(predictions, key=lambda x: x[1], reverse=True)[:n]
    recommended_ids = [pid for pid, _ in top_n]

    return {
        "user_id": user_id,
        "recommended_product_ids": recommended_ids,
        "message": f"Top {n} predicted products for user {user_id}"
    }

@app.get("/price")
def get_price(user_id: int, product_id: int):
    print(f"DEBUG: Calculating price for user={user_id}, product={product_id}")

    engine = get_db_engine()

    try:
        with engine.connect() as conn:
            # User loyalty
            user_query = text("SELECT loyalty_points FROM users WHERE id = :uid")
            user_result = conn.execute(user_query, {"uid": user_id})
            user_row = user_result.fetchone()

            if user_row is None:
                raise HTTPException(status_code=404, detail=f"User {user_id} not found")

            loyalty_points = int(user_row[0])  

            product_query = text("""
                SELECT base_price, sales_count, category 
                FROM products 
                WHERE id = :pid
            """)
            product_result = conn.execute(product_query, {"pid": product_id})
            product_row = product_result.fetchone()

            if product_row is None:
                raise HTTPException(status_code=404, detail=f"Product {product_id} not found")

            base_price   = float(product_row[0])
            sales_count  = int(product_row[1])
            category     = product_row[2]

        if pricing_info is None:
            return {
                "suggested_price": base_price,
                "discount_percent": 0.0,
                "reason": "Model not loaded - full price"
            }

        model = pricing_info['model']
        encoder = pricing_info['encoder']

        category_encoded = encoder.transform([category])[0] if category in encoder.classes_ else 0
        features = np.array([[loyalty_points, sales_count, category_encoded]])

        discount_frac = model.predict(features)[0]
        discount_percent = min(max(discount_frac * 100, 0), 35)

        suggested_price = base_price * (1 - discount_percent / 100)

        return {
            "suggested_price": round(suggested_price, 2),
            "discount_percent": round(discount_percent, 1),
            "reason": f"Based on loyalty {loyalty_points} pts + demand {sales_count} sales"
        }

    except Exception as e:
        print(f"Error in /price: {e}")
        raise HTTPException(status_code=500, detail=str(e))