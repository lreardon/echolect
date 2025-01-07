# Use an official Python runtime as the base image
FROM python:3.11

# Set the working directory in the container
WORKDIR /app

ENV MKL_THREADING_LAYER=GNU

# Copy the requirements file to the working directory
COPY requirements.txt .

# Install the required packages, including txtai with the api and pipeline extras
RUN pip install --no-cache-dir -r requirements.txt

# Install ffmpeg
RUN apt-get update && \
	apt-get install -y ffmpeg && \
	apt-get clean && \
	rm -rf /var/lib/apt/lists/*

# Copy the rest of the application code to the working directory
COPY . .

VOLUME /scripts
# VOLUME /data

# Specify the command to run when the container starts
# CMD ["python", "app.py"]