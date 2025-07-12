from flask import Flask, request, jsonify, render_template
from dotenv import load_dotenv
import google.generativeai as genai
import os

# Load environment variables
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

# Ensure API key is loaded
if not api_key:
    raise ValueError("GOOGLE_API_KEY not found in .env or environment variables.")

# Configure Gemini API
genai.configure(api_key=api_key)

# Initialize Gemini model
model = genai.GenerativeModel(model_name="models/Gemini 2.5 Pro")  # ✅ Use supported model

# Flask app setup
app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/ask", methods=["POST"])
def ask():
    prompt = request.json.get("prompt", "")
    try:
        # Gemini expects "parts" under "contents"
        response = model.generate_content(
            contents=[{"parts": [{"text": prompt}]}]
        )
        return jsonify({"response": response.text})
    except Exception as e:
        print("Gemini error:", e)
        return jsonify({"response": f"⚠️ Error: {str(e)}"}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port, debug=True)
