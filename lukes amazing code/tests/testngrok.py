import requests

NGROK_URL = "https://sunbird-adapted-dassie.ngrok-free.app"
DESCRIPTION = "announcement on yoshi getting hired as an intern at mario bros inc"

response = requests.post(
    f"{NGROK_URL}/set_description",
    json={"description": DESCRIPTION}
)

print("Status code:", response.status_code)
print("Response:", response.text) 