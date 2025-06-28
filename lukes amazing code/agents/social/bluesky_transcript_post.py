from atproto import Client
import requests
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in .env file or environment variables.")
genai.configure(api_key=GEMINI_API_KEY)

BLUESKY_HANDLE = os.getenv("BLUESKY_HANDLE")
BLUESKY_APP_PASSWORD = os.getenv("BLUESKY_APP_PASSWORD")
DESCRIPTION_URL = "https://sunbird-adapted-dassie.ngrok-free.app/description"

if not all([GEMINI_API_KEY, BLUESKY_HANDLE, BLUESKY_APP_PASSWORD]):
    raise ValueError("One or more required environment variables are not set. Please check your .env file.")

def fetch_transcript_from_url(url):
    response = requests.get(url)
    response.raise_for_status()
    return response.text

def generate_post_from_transcript(transcript_text):
    """
    Uses Gemini to generate a Bluesky-friendly post from the transcript.
    """
    prompt = f"""
    Based on the following transcript, create a compelling Bluesky post that:
    1. Is engaging and interesting
    2. Is concise and clear
    3. Uses a conversational tone
    4. Encourages engagement
    5. Stays within Bluesky's character limit (300 characters)

    Transcript:
    {transcript_text}

    Please return ONLY the Bluesky post text, nothing else.
    """
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content(prompt)
    return response.text.strip()

def post_to_bluesky_from_transcript():
    # Fetch transcript from public endpoint
    try:
        transcript = fetch_transcript_from_url(DESCRIPTION_URL)
    except Exception as e:
        print(f"Failed to fetch transcript: {e}")
        return False

    # Generate a Bluesky post using Gemini
    try:
        post_text = generate_post_from_transcript(transcript)
    except Exception as e:
        print("Gemini failed, using raw transcript.")
        post_text = transcript

    # Truncate to 300 characters (Bluesky limit)
    post_text = post_text[:300]

    # Post to Bluesky
    client = Client()
    client.login(BLUESKY_HANDLE, BLUESKY_APP_PASSWORD)
    client.send_post(post_text)
    print("✅ Posted to Bluesky!")
    return True

if __name__ == "__main__":
    post_to_bluesky_from_transcript() 