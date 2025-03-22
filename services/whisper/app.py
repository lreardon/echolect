from flask import Flask, request, jsonify
from decorators import endpoint
from utilities import download_file
import os
import uuid
from faster_whisper import WhisperModel

app = Flask(__name__)

# Initialize the model (adjust parameters as needed)
# model = WhisperModel("base", device="cpu", compute_type="int8")

@app.route('/', methods=['GET'])
@endpoint
def home(_):
    return jsonify({"returnValue": "Faster API is running!"}), 200


@app.route('/transcribe', methods=['POST'])
@endpoint
def process_audio(data):
    # Check if audioUrl is in the request
    if 'audioUrl' not in data:
        return jsonify({"error": "Missing required field: audioUrl"}), 400
    
    audio_url = data['audioUrl']
    
    audio_uuid = uuid.uuid4()

    audio_dir = f'/app/audio_files_to_process/{audio_uuid}'
    if not os.path.exists(audio_dir):
        os.makedirs(audio_dir)

    audio_path = f'{audio_dir}/audio.webm'
    transcription_path = f'{audio_dir}/transcription.txt'

    download_file(url=audio_url, save_path=audio_path)

    app.logger.info(f"Will look for model in: {os.path.abspath('./models')}")

    model = WhisperModel(
        "large-v3",        # "tiny", # TODO: Download and use "large-v3"
        device="cuda" if os.environ.get("CUDA_VISIBLE_DEVICES") else "cpu", 
        compute_type="float16" if os.environ.get("CUDA_VISIBLE_DEVICES") else "int8", # TODO: Try "float32"
        cpu_threads=4,
        download_root="/app/models",
        local_files_only=True
    )
    
    segments, info = model.transcribe(
        audio_path, 
        beam_size=5, 
        language=None,
        vad_filter=True,  # Filter out non-speech parts
        word_timestamps=True
    )

    transcription = {
        "text": "",
        "segments": [],
        "detected_language": info.language,
        "language_probability": info.language_probability
    }
    
    for segment in segments:
        transcription["text"] += segment.text + " "
        transcription["segments"].append({
            "id": segment.id,
            "start": segment.start,
            "end": segment.end,
            "text": segment.text,
            "words": [{"word": word.word, "start": word.start, "end": word.end, "probability": word.probability} 
                     for word in segment.words]
        })

    return jsonify({
        "audioUrl": audio_url,
        "audioUUID": str(audio_uuid),
        "transcription": transcription
    }), 501  # 202 Accepted indicates the request was valid but processing is ongoing

# @app.route('/healthcheck', methods=['GET'])
# def healthcheck():
#     return jsonify({"status": "healthy"})

# @app.route('/transcribe', methods=['POST'])
# def transcribe():
#     if 'audio' not in request.files:
#         return jsonify({"error": "No audio file provided"}), 400
    
#     audio_file = request.files['audio']
    
#     # Save uploaded file to a temporary location
#     with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
#         audio_file.save(temp_file.name)
#         temp_filename = temp_file.name
    
#     try:
#         # Transcribe the audio file
#         segments, info = model.transcribe(temp_filename)
        
#         # Format the results
#         result = {
#             "segments": [
#                 {
#                     "id": i,
#                     "start": segment.start,
#                     "end": segment.end,
#                     "text": segment.text.strip()
#                 } for i, segment in enumerate(segments)
#             ],
#             "language": info.language,
#             "language_probability": info.language_probability
#         }
        
#         # Clean up the temporary file
#         os.unlink(temp_filename)
        
#         return jsonify(result)
    
#     except Exception as e:
#         # Clean up the temporary file in case of error
#         if os.path.exists(temp_filename):
#             os.unlink(temp_filename)
#         return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=5001,
        use_reloader=True
    )