import sys
import os
import threading
from flask import Flask, request, Response, jsonify
import json
import logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Add the parent directory (flask-backend) to the Python path
# This allows us to import from the 'agents' and 'utils' directories
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from agents.social.slack_post import post_to_slack_from_simple_prompt
from agents.social.bluesky_transcript_post import post_to_bluesky_from_simple_prompt
from agents.web_editor.improve_website import improve_website_html, read_html_file, save_html_overwrite

app = Flask(__name__)
WEBSITE_HTML_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'agents', 'web_editor', 'peach_status.html'))

def improve_and_save_website(feedback, html_file_path):
    """Improve the website HTML and save it to the file."""
    try:
        html_content = read_html_file(html_file_path)
        improved_html = improve_website_html(feedback, html_content)
        save_html_overwrite(html_file_path, improved_html)
        logging.info(f"Successfully improved and saved website with feedback: {feedback}")
    except Exception as e:
        logging.error(f"Error improving website: {e}")

@app.route("/isAlive", methods=["GET"])
def isAlive():
    return jsonify({"success": True, "message": "Server is alive."})


@app.route("/send-slack-message-from-simple-prompt", methods=["POST"])
def send_slack_message():
    print(f"\n--- LOGGING /send-slack-message-from-simple-prompt ---")
    print(f"Headers:\n{request.headers}")
    print(f"Raw Body: {request.get_data(as_text=True)}")
    print("--------------------------------\n")
    data = request.get_json()
    if not data or "message" not in data:
        return jsonify({"success": False, "message": "Missing 'message' in request body."}), 400
    message = data["message"]
    post_to_slack_from_simple_prompt(message)
    return jsonify({"success": True, "message": "Message sent."})

@app.route("/send-bluesky-message-from-simple-prompt", methods=["POST"])
def send_bluesky_message():
    print(f"\n--- LOGGING /send-bluesky-message-from-simple-prompt ---")
    print(f"Headers:\n{request.headers}")
    print(f"Raw Body: {request.get_data(as_text=True)}")
    print("--------------------------------\n")
    logging.info(f"Received request for /send-bluesky-message-from-simple-prompt: {request}")
    data = request.get_json()
    
    if not data or "message" not in data:
        return jsonify({"success": False, "message": "Missing 'message' in request body."}), 400
    message = data["message"]
    post_to_bluesky_from_simple_prompt(message)
    return jsonify({"success": True, "message": "Message sent."})

@app.route("/update-website", methods=["POST"])
def update_website():
    print(f"\n--- LOGGING /update-website ---")
    print(f"Headers:\n{request.headers}")
    print(f"Raw Body: {request.get_data(as_text=True)}")
    print("--------------------------------\n")
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "Missing request body."}), 400
    
    # Run the website improvement and save in a background thread to avoid blocking
    thread = threading.Thread(
        target=improve_and_save_website,
        args=(data["message"], WEBSITE_HTML_FILE)
    )
    thread.start()

    # Return a response immediately
    return jsonify({"success": True, "message": "Website improvement has been initiated in the background."})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True) 