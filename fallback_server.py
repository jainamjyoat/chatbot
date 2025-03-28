from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def generate_health_context(metrics):
    context = "Based on your current health metrics:\n"
    
    if 'heart_rate' in metrics:
        hr = metrics['heart_rate']
        if hr > 100:
            context += "- Your heart rate is elevated. Consider taking a break and doing some deep breathing.\n"
        elif hr < 60:
            context += "- Your heart rate is low. Some light activity might help increase circulation.\n"
        else:
            context += "- Your heart rate is within a normal range.\n"
    
    if 'steps' in metrics:
        steps = metrics['steps']
        goal = 10000
        remaining = goal - steps
        if remaining > 0:
            context += f"- You need {int(remaining)} more steps to reach your daily goal.\n"
        else:
            context += "- Congratulations! You've reached your daily step goal!\n"
    
    if 'calories' in metrics:
        calories = metrics['calories']
        if calories < 2000:
            context += "- Your calorie burn is below target. Consider some additional activity.\n"
        else:
            context += "- You're maintaining good activity levels based on calorie burn.\n"
    
    return context

def get_time_based_recommendation():
    hour = datetime.now().hour
    
    if 5 <= hour < 9:
        return "This is a great time for morning exercise! Consider starting with some stretching or yoga."
    elif 9 <= hour < 12:
        return "Mid-morning is perfect for a quick walk or some desk exercises if you're working."
    elif 12 <= hour < 14:
        return "Consider taking a post-lunch walk to aid digestion and avoid afternoon fatigue."
    elif 14 <= hour < 17:
        return "Afternoon slump? Try some quick exercises to boost your energy."
    elif 17 <= hour < 20:
        return "Evening is a good time for a workout if you haven't exercised yet today."
    else:
        return "It's getting late. Focus on gentle stretching and prepare for quality sleep."

def generate_response(message, metrics):
    message_lower = message.lower()
    
    # Check for specific queries
    if "heart" in message_lower or "bpm" in message_lower:
        hr = metrics.get('heart_rate', 0)
        status = "elevated" if hr > 100 else "low" if hr < 60 else "normal"
        return f"Your heart rate is {hr} BPM, which is {status}. " + (
            "Try some deep breathing exercises." if hr > 100 else
            "Consider some light activity to boost circulation." if hr < 60 else
            "Keep up the good work!"
        )
    
    elif "step" in message_lower:
        steps = metrics.get('steps', 0)
        remaining = 10000 - steps
        return f"You've taken {int(steps)} steps today. " + (
            f"Just {int(remaining)} more to reach your goal!" if remaining > 0 else
            "Congratulations! You've reached your daily step goal!"
        )
    
    elif "calorie" in message_lower:
        calories = metrics.get('calories', 0)
        return f"You've burned {int(calories)} calories today. " + (
            "Consider adding some more activity to reach your daily goal." if calories < 2000 else
            "Great job maintaining an active lifestyle!"
        )
    
    elif "recommend" in message_lower or "suggest" in message_lower:
        time_rec = get_time_based_recommendation()
        health_rec = generate_health_context(metrics)
        return f"{time_rec}\n\n{health_rec}"
    
    elif "help" in message_lower:
        return """I can help you with:
• Tracking your heart rate
• Monitoring your step count
• Analyzing your calorie burn
• Providing personalized health recommendations
• Setting and tracking fitness goals

Just ask me about any of these topics!"""
    
    else:
        return f"I'm here to help with your health tracking! {get_time_based_recommendation()}\n\nYou can ask me about your heart rate, steps, calories, or request recommendations."

@app.route('/chat', methods=['POST'])
def chat_endpoint():
    try:
        data = request.json
        message = data.get('message', '')
        health_metrics = data.get('health_metrics', {})
        
        response = generate_response(message, health_metrics)
        return jsonify({"response": response})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("Server is running at http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=True) 