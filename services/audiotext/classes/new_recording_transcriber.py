from typing import Optional
from txtai.pipeline import Transcription
from watchdog.events import FileSystemEvent, FileSystemEventHandler

class NewRecordingTranscriber(FileSystemEventHandler):
    def __init__(
        self,
        transcriber: Optional[Transcription] = None,
        model_name: str = "openai/whisper-base"
      ):
        self.transcriber = transcriber if transcriber else Transcription(model_name)
      
    def transcribe_file(self, path: str) -> None:
      if path.endswith(".flac"):
        print(f"Transcribing file {path}", flush=True)
        text = self.transcriber(path)
        print(f"Transcription successful.", flush=True)
        transcription_path = path.replace(".flac", ".txt")
        with open(transcription_path, 'w') as out:
          out.write(text)
        print(f"Transcription saved to {transcription_path}", flush=True)
      else:
        print(f"File {path} is not a FLAC file. Skipping transcription.", flush=True)

    def on_created(self, event: FileSystemEvent) -> None:
      print(f"Event detected: {event}", flush=True)
      if not event.is_directory:
        print(f"New file detected: {event.src_path}")
        if event.src_path.endswith(".flac"):
          self.transcribe_file(event.src_path)