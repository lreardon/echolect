FROM lscr.io/linuxserver/faster-whisper:latest

# Install the required Python packages
RUN apt-get update && apt-get install -y python3-pip

# # Install application dependencies
# # Install Flask and related packages
# RUN pip3 install flask gunicorn flask-cors
# RUN pip3 install -U whisper-ctranslate2
# # Install diarization requirements
# RUN pip3 install pyannote.audio

# Install application dependencies
COPY requirements.txt /app/
RUN pip3 install -r /app/requirements.txt


# Clean up
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy application files
COPY app.py /app/
COPY wsgi.py /app/

# Expose port for Flask
EXPOSE 5000

RUN pip3 install gunicorn

# Run the Flask application
CMD ["gunicorn", "--bind", "0.0.0.0:5001", "--reload",  "wsgi:app"]