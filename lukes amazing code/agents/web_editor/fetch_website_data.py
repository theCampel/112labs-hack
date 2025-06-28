import requests
import json

URL = "https://sunbird-adapted-dassie.ngrok-free.app/website-data"

def fetch_website_data():
    """
    Fetches website data from the specified URL and prints it.
    """
    print(f"Fetching data from {URL}...")
    try:
        response = requests.get(URL)
        response.raise_for_status()  # Raise an exception for bad status codes

        data = response.json()

        print("\nSuccessfully fetched data:")
        print(json.dumps(data, indent=2))  # Pretty-print the JSON

        return data

    except requests.exceptions.RequestException as e:
        print(f"\nAn error occurred: {e}")
        print("Please ensure the ngrok tunnel and the Flask server are running correctly.")
    except json.JSONDecodeError:
        print("\nError: Failed to decode JSON from the response.")
        print(f"Response content: {response.text}")

if __name__ == "__main__":
    fetch_website_data() 