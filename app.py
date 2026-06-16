from flask import Flask, jsonify, request

app = Flask(__name__)

notes = {}
next_id = 1

@app.route("/notes", methods=["GET"])
def get_notes():
    return jsonify(notes)

@app.route("/notes/<int:note_id>", methods=["GET"])
def get_note(note_id):
    note = notes.get(note_id)
    if note is None:
        return jsonify({"error": "Note not found"}), 404
    return jsonify(note)

@app.route("/notes", methods=["POST"])
def create_note():
    global next_id
    data = request.get_json()
    if not data or "content" not in data:
        return jsonify({"error": "Content is required"}), 400
    note = {"id": next_id, "content": data["content"]}
    notes[next_id] = note
    next_id += 1
    return jsonify(note), 201

@app.route("/notes/<int:note_id>", methods=["PUT"])
def update_note(note_id):
    note = notes.get(note_id)
    if note is None:
        return jsonify({"error": "Note not found"}), 404
    data = request.get_json()
    if not data or "content" not in data:
        return jsonify({"error": "Content is required"}), 400
    note["content"] = data["content"]
    return jsonify(note)

@app.route("/notes/<int:note_id>", methods=["DELETE"])
def delete_note(note_id):
    if note_id not in notes:
        return jsonify({"error": "Note not found"}), 404
    del notes[note_id]
    return "", 204

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
