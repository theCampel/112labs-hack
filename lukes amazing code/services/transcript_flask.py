from flask import Flask, request, Response, jsonify
import os
import json

app = Flask(__name__)
DESCRIPTION_FILE = "description.txt"
WEBSITE_DATA_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'agents', 'web_editor', 'website_data.json'))

@app.route("/set_description", methods=["POST"])
def set_description():
    data = request.get_json()
    if not data or "description" not in data:
        return jsonify({"success": False, "message": "Missing 'description' in request body."}), 400
    description = data["description"]
    with open(DESCRIPTION_FILE, "w", encoding="utf-8") as f:
        f.write(description)
    return jsonify({"success": True, "message": "Description updated."})

@app.route("/description", methods=["GET"])
def get_description():
    if not os.path.exists(DESCRIPTION_FILE):
        return Response("", mimetype="text/plain")
    with open(DESCRIPTION_FILE, "r", encoding="utf-8") as f:
        return Response(f.read(), mimetype="text/plain")

@app.route("/update-website", methods=["POST"])
def update_website():
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "Missing request body."}), 400
    with open(WEBSITE_DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    return jsonify({"success": True, "message": "Website data updated."})

@app.route("/website-data", methods=["GET"])
def get_website_data():
    if not os.path.exists(WEBSITE_DATA_FILE):
        return jsonify({})
    with open(WEBSITE_DATA_FILE, "r", encoding="utf-8") as f:
        return jsonify(json.load(f))

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True) 