from http.server import BaseHTTPRequestHandler, HTTPServer
import json
from datetime import datetime
import urllib.parse
import os
import mimetypes
import requests  # Import requests to make HTTP requests

class ChatHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status_code=200, content_type='application/json'):
        self.send_response(status_code)
        self.send_header('Content-type', content_type)
        self.send_header('Access-Control-Allow-Origin', '*')  # CORS header
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_OPTIONS(self):
        # Handle preflight requests for CORS
        self._set_headers()
    
    def do_GET(self):
        # Root path, serve index.html
        path = self.path
        if path == "/" or path == "":
            path = "/index.html"
            
        # Security check to avoid directory traversal attacks
        if ".." in path:
            self._set_headers(403, 'text/plain')
            self.wfile.write(b"Access forbidden")
            return
            
        try:
            # Get the current directory
            current_dir = os.path.dirname(os.path.abspath(__file__))
            file_path = os.path.join(current_dir, path.lstrip('/'))
            
            # Check if file exists
            if not os.path.isfile(file_path):
                self._set_headers(404, 'text/plain')
                self.wfile.write(b"File not found")
                return
                
            # Determine MIME type
            mimetype, _ = mimetypes.guess_type(file_path)
            if mimetype is None:
                mimetype = 'application/octet-stream'
            
            # Read and serve the file
            with open(file_path, 'rb') as f:
                self.send_response(200)
                self.send_header('Content-type', mimetype)
                self.end_headers()
                self.wfile.write(f.read())
        except Exception as e:
            self._set_headers(500, 'text/plain')
            self.wfile.write(f"Server error: {str(e)}".encode('utf-8'))
    
    def do_POST(self):
        if self.path == '/chat':
            # Get the data length and read the request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                # Parse the JSON data
                data = json.loads(post_data.decode('utf-8'))
                message = data.get('message', '')
                health_metrics = data.get('health_metrics', {})
                
                # Generate response
                response = self.generate_response(message, health_metrics)
                
                # Send response
                self._set_headers()
                self.wfile.write(json.dumps({"response": response}).encode('utf-8'))
            except Exception as e:
                self._set_headers(500)
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Not found"}).encode('utf-8'))
    
    def generate_health_context(self, metrics):
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
    
    def get_time_based_recommendation(self):
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
    
    def generate_response(self, message, metrics):
        # Call Gemini API to get a response
        gemini_response = self.call_gemini_api(message)
        return gemini_response

    def call_gemini_api(self, message):
        api_key = "AIzaSyBdtXSkUEemDK_U4wCVhIYRB-Ou-76qoRc"  # Replace with your actual API key
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
        headers = {
            'Content-Type': 'application/json'
        }
        payload = {
            "contents": [{
                "parts": [{"text": message}]
            }]
        }
        try:
            response = requests.post(url, headers=headers, json=payload)
            response.raise_for_status()  # Raise an error for bad responses
            response_data = response.json()
            # Log the response for debugging
            print("Gemini API Response:", response_data)
            # Extract the text response from the API
            text_response = response_data.get('contents', [{}])[0].get('parts', [{}])[0].get('text', '')
            return text_response
        except requests.exceptions.HTTPError as http_err:
            return f"HTTP error occurred: {http_err}"
        except Exception as e:
            return f"Error calling Gemini API: {str(e)}"

def run_server(server_class=HTTPServer, handler_class=ChatHandler, port=5000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f"Server is running at http://localhost:{port}")
    httpd.serve_forever()

if __name__ == "__main__":
    run_server()