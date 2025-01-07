FROM lscr.io/linuxserver/faster-whisper:latest

# Install the required Python package
RUN apt-get update && apt-get install -y python3-pip

RUN pip3 install -U whisper-ctranslate2

# To enable diarization you need to follow these steps:
#     Install pyannote.audio with pip install pyannote.audio
#     Accept pyannote/segmentation-3.0 user conditions
#     Accept pyannote/speaker-diarization-3.1 user conditions
#     Create an access token at hf.co/settings/tokens.
# And then execute passing the HuggingFace API token as parameter to enable diarization:
# whisper-ctranslate2 --hf_token YOUR_HF_TOKEN

RUN pip3 install pyannote.audio


# Clean up
RUN apt-get clean && rm -rf /var/lib/apt/lists/*