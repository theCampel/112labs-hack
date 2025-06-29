import requests
import json
import os
import sys
from dotenv import load_dotenv
from google import genai

# Add the utils directory to the path so we can import prompt_loader
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "..", "utils"))
from prompt_loader import load_and_format_prompt

load_dotenv()

# --- Configuration ---
# Initialize client with environment variables
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
NGROK_BASE_URL = os.getenv("NGROK_BASE_URL", "https://advanced-possibly-lab.ngrok-free.app")
WEBSITE_DATA_URL = f"{NGROK_BASE_URL}/website-data"
HTML_FILE_PATH = os.path.join(os.path.dirname(__file__), "peach_status.html")

# --- Helper Functions ---

def read_html_file(path):
    """Reads the content of the HTML file."""
    print(f"Reading HTML from {path}...")
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

def improve_website_html(feedback, html_content):
    """Calls Gemini API to get an improved version of the HTML."""
    
    prompt = load_and_format_prompt("improve_website_html", feedback=feedback, html_content=html_content)
    
    response = client.models.generate_content(
        model="gemini-2.5-flash", 
        contents=prompt
    )
    return response.text.strip()

def save_html_overwrite(path, content):
    """Saves the improved HTML content, overwriting the original file."""
    print(f"Overwriting HTML file at {path}...")
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("✅ Successfully updated the HTML file.")

# --- Main Execution ---
if __name__ == "__main__":
    try:
        # 1. Fetch data and read HTML
        html_content = read_html_file(HTML_FILE_PATH)
        
        # 2. Extract feedback
        feedback = "Change the color of the background to red."
        
        # 3. Get improved HTML from AI
        improved_html = improve_website_html(feedback, html_content)
        
        # 4. Overwrite the original HTML file
        save_html_overwrite(HTML_FILE_PATH, improved_html)

    except requests.exceptions.RequestException as e:
        print(f"\n❌ An error occurred while communicating with a service: {e}")
    except FileNotFoundError as e:
        print(f"\n❌ File not found: {e}")
    except Exception as e:
        print(f"\n❌ An unexpected error occurred: {e}") 