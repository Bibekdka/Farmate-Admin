import os
import google.generativeai as genai

from flask import Blueprint, request, jsonify
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

ai_routes = Blueprint("ai_routes", __name__)

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100 per day", "20 per hour"]
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    # Fallback to check if it's in a different env variable or just warn
    print("WARNING: GEMINI_API_KEY missing in routes/ai_routes.py")

# Configure Gemini
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def get_ai_model():
    if not GEMINI_API_KEY:
        return None
    return genai.GenerativeModel("gemini-1.5-flash")


@ai_routes.route("/api/ai", methods=["POST"])
@limiter.limit("10/minute")
def ai_chat():
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "error": "Missing request body"
            }), 400

        prompt = data.get("message")

        if not prompt:
            return jsonify({
                "error": "Message is required"
            }), 400

        if len(prompt) > 5000:
            return jsonify({
                "error": "Message too long"
            }), 400

        model = get_ai_model()
        if not model:
            return jsonify({
                "error": "AI Service is not configured. Please set GEMINI_API_KEY."
            }), 503

        response = model.generate_content(prompt)

        return jsonify({
            "response": response.text
        })
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500

@ai_routes.route("/api/ai/analyze_logs", methods=["POST"])
@limiter.limit("5/minute")
def analyze_logs_api():
    try:
        from backend.models.models import Note
        import datetime
        
        # Get logs from last 7 days
        week_ago = datetime.datetime.now() - datetime.timedelta(days=7)
        logs = Note.query.filter(Note.created_at >= week_ago).order_by(Note.created_at.asc()).all()
        
        if not logs:
            return jsonify({
                "status": "warning",
                "message": "No logs found for the last 7 days to analyze."
            })

        log_text = "\n".join([f"- {l.created_at.strftime('%Y-%m-%d')}: {l.content}" for l in logs])
        
        prompt = f"""
        As an expert agricultural assistant, analyze these farm logs from the past week and provide:
        1. A brief summary of progress.
        2. Any potential issues or patterns (weather, pests, workload).
        3. Actionable advice for the coming week.

        Farm Logs:
        {log_text}
        
        Format the response in clear Markdown.
        """

        model = get_ai_model()
        if not model:
            return jsonify({
                "error": "AI Service not configured"
            }), 503

        response = model.generate_content(prompt)

        return jsonify({
            "status": "success",
            "content": response.text
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500

@ai_routes.route("/api/ai/ask_crop_doctor", methods=["POST"])
def ask_crop_doctor_api():
    try:
        data = request.json
        crop_name = data.get('crop_name')
        sowing_date = data.get('sowing_date')
        
        context = f"Planted on {sowing_date}" if sowing_date else "Planning to plant"
        prompt = f"""
        You are an expert Agronomist. The farmer is asking about '{crop_name}' ({context}).
        Provide a concise Markdown response covering:
        1. Common Pests & Diseases to watch out for NOW.
        2. Watering & Care tips.
        3. Estimated Harvest time from now.
        
        Keep it brief and practical. Use bullet points.
        """
        
        model = get_ai_model()
        if not model:
            return jsonify({"error": "AI Service not configured"}), 503
            
        response = model.generate_content(prompt)
        return jsonify({
            "status": "success",
            "content": response.text
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@ai_routes.route("/api/ai/recommend_crops", methods=["POST"])
def recommend_crops_api():
    try:
        data = request.json
        area = data.get('area', '1 Acre')
        season = data.get('season', 'Current')
        
        prompt = f"""
        Act as an Agriculture Business Consultant.
        The user has {area} of land available in {season} (Location: India).
        
        Suggest 3 most profitable vegetable/crop options.
        For each option, provide:
        1. Estimated Profit Potential (High/Med/Low)
        2. Duration (Days to harvest)
        3. Why this crop? (Market demand, weather suitability)
        
        Format the response in clear Markdown.
        """
        
        model = get_ai_model()
        if not model:
            return jsonify({"error": "AI Service not configured"}), 503
            
        response = model.generate_content(prompt)
        return jsonify({
            "status": "success",
            "content": response.text
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@ai_routes.route("/api/ai/estimate_duration", methods=["POST"])
def estimate_duration_api():
    try:
        data = request.json
        crop_name = data.get('crop_name')
        
        prompt = f"""
        How many days does '{crop_name}' typically take from sowing to harvest?
        Return ONLY the number of days as an integer (e.g. 90). 
        If it varies, give a safe average.
        """
        
        model = get_ai_model()
        if not model:
            return jsonify({"error": "AI Service not configured"}), 503
            
        response = model.generate_content(prompt)
        
        import re
        match = re.search(r'\d+', response.text)
        if match:
            return jsonify({
                "status": "success",
                "days": int(match.group())
            })
        return jsonify({"status": "error", "message": "Could not parse duration"}), 400
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
