import os
# import subprocess
import time
# import json
from txtai.pipeline import Transcription
from watchdog.observers import Observer
from classes.new_recording_transcriber import NewRecordingTranscriber


def watch_directory(path):
		print('Creating event handler...', flush=True)
		event_handler = NewRecordingTranscriber(
			transcriber=Transcription("openai/whisper-base")
		)
		print(event_handler, flush=True)
		print("Okay!", flush=True)
		
		print('Creating watchdog observer...', flush=True)
		observer = Observer()
		print(observer, flush=True)
		print("Okay!", flush=True)
		
		print('Scheduling event handler on observer...', flush=True)
		observer.schedule(event_handler, path, recursive=False)
		print("Okay!", flush=True)

		print('Starting observer...', flush=True)
		observer.start()
		print("Okay!", flush=True)

		# print('Joining observer...', flush=True)
		# observer.join()
		# print("Okay!", flush=True)

def main():
		recordings_directory = "recordings"
		transcriptions_directory = "transcriptions"

		os.makedirs(recordings_directory, exist_ok=True)
		os.makedirs(transcriptions_directory, exist_ok=True)    

		print("Establishing listener...", flush=True)
		try:
			print(f"Recordings directory: {recordings_directory}", flush=True)
			watch_directory(recordings_directory)
		
			print("Watching for new recordings...", flush=True)
		
			while True:
				time.sleep(10)
		except Exception as e:
			print(f"An error occurred: {e}", flush=True)
			print("Shutting down...", flush=True)
			

if __name__ == "__main__":
		main()