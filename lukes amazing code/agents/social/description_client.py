import requests

DESCRIPTION_URL = "https://sunbird-adapted-dassie.ngrok-free.app/description"
SET_DESCRIPTION_URL = "https://sunbird-adapted-dassie.ngrok-free.app/set_description"

def get_description():
    response = requests.get(DESCRIPTION_URL)
    response.raise_for_status()
    return response.text

def set_description(text):
    response = requests.post(SET_DESCRIPTION_URL, json={"description": text})
    response.raise_for_status()
    return response.json()
