import requests
import os
from dotenv import load_dotenv

load_dotenv()

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions"

SLACK_WEBHOOK_URL = os.getenv("SLACK_WEBHOOK_URL")
DESCRIPTION_URL = "https://sunbird-adapted-dassie.ngrok-free.app/description"

if not all([DEEPSEEK_API_KEY, SLACK_WEBHOOK_URL]):
    raise ValueError("One or more required environment variables are not set. Please check your .env file.")

def fetch_transcript_from_url(url):
    response = requests.get(url)
    response.raise_for_status()
    return response.text

def generate_post_from_transcript(transcript_text):
    """
    Uses DeepSeek to generate a Slack-friendly post from the transcript.
    """
    prompt = f"""
    Based on the following transcript, create a compelling Slack post that:
    1. Is engaging and interesting
    2. Is concise and clear
    3. Uses a conversational tone
    4. Encourages engagement

    Transcript:
    {transcript_text}

    Please return ONLY the Slack post text, nothing else.
    """
    headers = {
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "deepseek-chat",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 150,
        "temperature": 0.7
    }
    response = requests.post(DEEPSEEK_URL, headers=headers, json=data, timeout=30)
    response.raise_for_status()
    result = response.json()
    return result["choices"][0]["message"]["content"].strip()

def post_to_slack_from_transcript(webhook_url=SLACK_WEBHOOK_URL):
    # Fetch transcript from public endpoint
    try:
        transcript = fetch_transcript_from_url(DESCRIPTION_URL)
    except Exception as e:
        print(f"Failed to fetch transcript: {e}")
        return False

    # Generate a Slack post using DeepSeek
    try:
        post_text = generate_post_from_transcript(transcript)
    except Exception as e:
        print("DeepSeek failed, using raw transcript.")
        post_text = transcript

    # Post to Slack
    data = {"text": post_text}
    response = requests.post(webhook_url, json=data)
    if response.status_code == 200:
        print("Successfully posted to Slack!")
        return True
    else:
        print(f"Failed to post to Slack: {response.status_code} {response.text}")
        return False

if __name__ == "__main__":
    post_to_slack_from_transcript() 