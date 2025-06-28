import requests
import json
import os

# Assuming the Flask app is running on localhost:8000 and exposed via ngrok
BASE_URL = "https://sunbird-adapted-dassie.ngrok-free.app"
UPDATE_URL = f"{BASE_URL}/update-website"
DATA_URL = f"{BASE_URL}/website-data"

# 1. Get the original data to restore it later
print("Fetching original website data...")
try:
    original_response = requests.get(DATA_URL)
    original_response.raise_for_status()
    original_data = original_response.json()
    print("Successfully fetched original data.")
except requests.exceptions.RequestException as e:
    print(f"Error fetching original data: {e}")
    original_data = None

# 2. Define new data and update the website
new_data = {
    "content": {
        "footer": "This is a test footer.",
        "feedback": "The color scheme is great!"
    },
    "status": {
        "current_status": "TESTING",
        "emoji": "🧪",
        "color": "#00FF00"
    }
}

print("\nUpdating website data with new test data...")
try:
    update_response = requests.post(UPDATE_URL, json=new_data)
    update_response.raise_for_status()
    print("Update request successful.")
    print("Response:", update_response.json())

    # 3. Fetch the updated data to verify
    print("\nFetching updated data to verify...")
    get_response = requests.get(DATA_URL)
    get_response.raise_for_status()
    retrieved_data = get_response.json()
    print("Successfully fetched updated data.")

    # 4. Compare the retrieved data with the new data
    if retrieved_data == new_data:
        print("\n✅ Verification successful! The website data was updated correctly.")
    else:
        print("\n❌ Verification failed! The retrieved data does not match the test data.")
        print("Expected:", json.dumps(new_data, indent=2))
        print("Got:", json.dumps(retrieved_data, indent=2))

except requests.exceptions.RequestException as e:
    print(f"\nAn error occurred during testing: {e}")
    print("Please ensure the Flask server in 'services/transcript_flask.py' is running.")

finally:
    # 5. Restore the original data
    if original_data is not None:
        print("\nRestoring original website data...")
        try:
            restore_response = requests.post(UPDATE_URL, json=original_data)
            restore_response.raise_for_status()
            print("Successfully restored original data.")
        except requests.exceptions.RequestException as e:
            print(f"Error restoring original data: {e}") 