import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

# --- Configuration ---
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
if not DEEPSEEK_API_KEY:
    raise ValueError("DEEPSEEK_API_KEY not found in .env file or environment variables.")
DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions"
WEBSITE_DATA_URL = "https://sunbird-adapted-dassie.ngrok-free.app/website-data"
HTML_FILE_PATH = os.path.join(os.path.dirname(__file__), "peach_status.html")

# --- Helper Functions ---
def fetch_website_data(url):
    """Fetches the website data JSON from the given URL."""
    print(f"Fetching feedback from {url}...")
    response = requests.get(url)
    response.raise_for_status()
    return response.json()

def read_html_file(path):
    """Reads the content of the HTML file."""
    print(f"Reading HTML from {path}...")
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

def get_improved_html(feedback, html_content):
    """Calls DeepSeek API to get an improved version of the HTML."""
    print("Calling DeepSeek API for website improvements...")
    prompt = f"""
    Based on the following user feedback, please rewrite the provided HTML file to incorporate the requested changes.

    **User Feedback:**
    "{feedback}"

    **Original HTML:**
    ```html
    {html_content}
    ```

    Please return ONLY the complete, raw, updated HTML code. Do not include any commentary, explanations, or markdown code fences like ```html.
    """
    
    headers = {
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "deepseek-chat",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.5,
    }
    
    response = requests.post(DEEPSEEK_URL, headers=headers, json=data, timeout=60)
    response.raise_for_status()
    result = response.json()
    return result["choices"][0]["message"]["content"].strip()

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
        website_data = fetch_website_data(WEBSITE_DATA_URL)
        html_content = read_html_file(HTML_FILE_PATH)
        
        # 2. Extract feedback
        feedback = website_data.get("content", {}).get("feedback")
        if not feedback:
            raise ValueError("No feedback found in the website data.")
        
        # 3. Get improved HTML from AI
        improved_html = get_improved_html(feedback, html_content)
        
        # 4. Overwrite the original HTML file
        save_html_overwrite(HTML_FILE_PATH, improved_html)

    except requests.exceptions.RequestException as e:
        print(f"\n❌ An error occurred while communicating with a service: {e}")
    except FileNotFoundError as e:
        print(f"\n❌ File not found: {e}")
    except Exception as e:
        print(f"\n❌ An unexpected error occurred: {e}") 