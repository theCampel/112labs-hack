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
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
SLACK_WEBHOOK_URL = os.getenv("SLACK_WEBHOOK_URL")


def generate_post_from_prompt(prompt_text):
    """
    Uses Gemini to generate a Slack-friendly post from the prompt.
    """
    prompt = load_and_format_prompt("generate_post_from_prompt", prompt_text=prompt_text)
    
    response = client.models.generate_content(
        model="gemini-2.0-flash", 
        contents=prompt
    )
    return response.text.strip()

def post_to_slack_from_simple_prompt(prompt_text):
    post_text = generate_post_from_prompt(prompt_text)

    data = {"text": post_text}
    response = requests.post(SLACK_WEBHOOK_URL, json=data)
    if response.status_code == 200:
        print("Successfully posted to Slack!")
        return True
    else:
        print(f"Failed to post to Slack: {response.status_code} {response.text}")
        return False
    

if __name__ == "__main__":
    post_to_slack_from_simple_prompt("A post on the new Hire, Yoshi") 