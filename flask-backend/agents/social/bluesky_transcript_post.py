from atproto import Client
import requests
import os
import sys
from dotenv import load_dotenv
from google import genai

# Add the utils directory to the path so we can import prompt_loader
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "..", "utils"))
from prompt_loader import load_and_format_prompt

load_dotenv()

# Initialize clients with environment variables
gemini_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
BLUESKY_HANDLE = os.getenv("BLUESKY_HANDLE")
BLUESKY_APP_PASSWORD = os.getenv("BLUESKY_APP_PASSWORD")


def generate_post_from_prompt(prompt_text):
    """
    Uses Gemini to generate a Bluesky-friendly post from the prompt.
    """
    prompt = load_and_format_prompt("bluesky_post_from_prompt", prompt_text=prompt_text)
    
    response = gemini_client.models.generate_content(
        model="gemini-2.0-flash", 
        contents=prompt
    )
    return response.text.strip()

def post_to_bluesky_from_simple_prompt(prompt_text):
    post_text = generate_post_from_prompt(prompt_text)

    # Truncate to 300 characters (Bluesky limit)
    post_text = post_text[:300]

    # Post to Bluesky
    bluesky_client = Client()
    bluesky_client.login(BLUESKY_HANDLE, BLUESKY_APP_PASSWORD)
    bluesky_client.send_post(post_text)
    print("✅ Posted to Bluesky!")
    return True

if __name__ == "__main__":
    post_to_bluesky_from_simple_prompt("A post on the recent launch, Princess Tracker") 