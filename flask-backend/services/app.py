import sys
import os
import threading
from flask import Flask, request, Response, jsonify
import json

# Add the parent directory (flask-backend) to the Python path
# This allows us to import from the 'agents' and 'utils' directories
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from agents.social.slack_post import post_to_slack_from_simple_prompt
from agents.social.bluesky_transcript_post import post_to_bluesky_from_simple_prompt
from agents.web_editor.improve_website import improve_website_html, read_html_file

app = Flask(__name__)
WEBSITE_HTML_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'agents', 'web_editor', 'peach_status.html'))

@app.route("/isAlive", methods=["GET"])
def isAlive():
    return jsonify({"success": True, "message": "Server is alive."})


@app.route("/send-slack-message-from-simple-prompt", methods=["POST"])
def send_slack_message():
    data = request.get_json()
    if not data or "message" not in data:
        return jsonify({"success": False, "message": "Missing 'message' in request body."}), 400
    message = data["message"]
    post_to_slack_from_simple_prompt(message)
    return jsonify({"success": True, "message": "Message sent."})

@app.route("/send-bluesky-message-from-simple-prompt", methods=["POST"])
def send_bluesky_message():
    data = request.get_json()
    if not data or "message" not in data:
        return jsonify({"success": False, "message": "Missing 'message' in request body."}), 400
    message = data["message"]
    post_to_bluesky_from_simple_prompt(message)
    return jsonify({"success": True, "message": "Message sent."})

@app.route("/update-website", methods=["POST"])
def update_website():
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "Missing request body."}), 400
    
    # Run the Gemini API call in a background thread to avoid blocking
    thread = threading.Thread(
        target=improve_website_html,
        args=(data["description"], read_html_file(WEBSITE_HTML_FILE))
    )
    thread.start()

    # Return a response immediately
    return jsonify({"success": True, "message": "Website improvement has been initiated in the background."})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True) 