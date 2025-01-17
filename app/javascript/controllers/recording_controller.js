
import audioChannel from "../channels/audio_channel";
import ApplicationController from "./application_controller";

export default class extends ApplicationController {
  static targets = ["recordingButton", "recordingInput", "uploadRecordingForm"];

  initialize() {
    this.isRecording = false;
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  async toggleRecording() {
    const button = this.recordingButtonTarget;
    button.classList.toggle("recording");
    if (!this.isRecording) {
      // Request access to the microphone
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        // const options = { mimeType: 'audio/ogg' };
        let options;
        if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) {
          options = { mimeType: "audio/ogg;codecs=opus" };
        } else if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
          options = { mimeType: "audio/webm;codecs=opus" };
        } else {
          console.warn(
            "Neither Ogg Opus nor WebM Opus are supported, using default codec"
          );
          options = {};
        }

        const timestamp = new Date().toISOString().replace(/[-:.]/g, "");
        const filename = `lecture_${timestamp}`;

        this.mediaRecorder = new MediaRecorder(stream);

        this.mediaRecorder.ondataavailable = (event) => {
          this.audioChunks.push(event.data);

          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result.split(",")[1];
            audioChannel.sendAudioData(filename, base64data);
          };

          reader.readAsDataURL(event.data);
        };

        this.mediaRecorder.onstop = () => {
          audioChannel.processAudio(filename);
          this.audioChunks = [];
        };

        this.mediaRecorder.start(1000);

        this.isRecording = true;
        button.innerText = "Stop";
      } catch (error) {
        console.error("Error accessing the microphone", error);
      }
    } else {
      this.mediaRecorder.requestData();
      this.mediaRecorder.stop();
      this.isRecording = false;
      button.innerText = "Record";
    }
    button.innerText = button.classList.contains("recording")
      ? "Stop"
      : "Record";
  }

  triggerFileInput(event) {
    event.preventDefault();
    const lectureId = this.uploadRecordingFormTarget.dataset.lectureId;
    const fileInput = this.recordingInputTarget;

    // console.log(fileInput);
    
    fileInput.onchange = (event) => {
      const file = event.target.files[0];
      console.log(file);

      if (file == null) {
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
      const base64Data = reader.result.split(',')[1];
      this.stimulate('Recordings#upload', { 
        data: base64Data,
        name: file.name,
        type: file.type,
        lectureId: lectureId
      });
    };
    reader.readAsDataURL(file);

      // const form = fileInput.closest("form");
      // form.submit();
    };

    fileInput.click();
  }
}
