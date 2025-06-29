import requests
import os
from dotenv import load_dotenv

load_dotenv()

NGROK_BASE_URL = os.getenv("NGROK_BASE_URL", "https://advanced-possibly-lab.ngrok-free.app")
DESCRIPTION_URL = f"{NGROK_BASE_URL}/description"
SET_DESCRIPTION_URL = f"{NGROK_BASE_URL}/set-description"

def get_description():
    response = requests.get(DESCRIPTION_URL)
    response.raise_for_status()
    return response.text

def set_description(text):
    response = requests.post(SET_DESCRIPTION_URL, json={"description": text})
    response.raise_for_status()
    return response.json()
