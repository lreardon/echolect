
import audioChannel from "../channels/audio_channel";
import QueueProcessor from "../classes/queue_processor";
import formatTime from "../utils/format_time";
import ApplicationController from "./application_controller";

export default class extends ApplicationController {
  static targets = ["recordingButton", "uploadRecordingForm"];

  declare isRecording: boolean;
  declare mediaRecorder: MediaRecorder;
  declare recordingButtonTarget: HTMLButtonElement;
  declare recordingId: String;
  declare recordingDuration: number;
  declare recordingInterval: number | undefined;
  declare chunkCounter: number;

  initialize() {
    this.isRecording = false;
  }

  async toggleRecording() {
    const recordingStatusDisplay = document.getElementById("recording-status-display");
    const button = this.recordingButtonTarget;
    
    const lectureId = button.dataset.lectureId;
    if (!lectureId) {
      console.error("Could not find active lecture.");
      return;
    }
    
    if (!this.isRecording) {
      try {
        //* Set options
        // const options = { mimeType: 'audio/ogg' };
        const timestamp = new Date().toISOString();
        this.chunkCounter = 0;
        
        const audioChunksUploader = new QueueProcessor(
          new Array<Blob>(),
          async (chunk: Blob) => {
            try {
              const reader = new FileReader()
              reader.onload = (e) => {
                const base64data = reader.result
                
                if (lectureId && this.recordingId && base64data) {
                  const encodingData = base64data.toString().split(',')[0];
                  const base64String = base64data.toString().split(',')[1];
                  audioChannel.sendAudioChunk({
                    lectureId,
                    recordingId: this.recordingId,
                    timestamp,
                    encodingData,
                    base64String,
                    chunkNumber: this.chunkCounter,
                  });
                  this.chunkCounter++;
                }
                
              }
              reader.onerror = () => {                
                console.log('error')
              }
              reader.readAsDataURL(chunk)
            }
            catch (error) {
              console.error("Error sending audio data:", error);
              return false;
            }
            
            return true;
          }
        );
        
        // Request access to the microphone if necessary.
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        
        // Initialize the MediaRecorder with callbacks.
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.onstart = () => {
          this.recordingId = crypto.randomUUID();
          audioChannel.initializeRecording({
            recordingId: this.recordingId,
            lectureId: lectureId,
          });
          
          this.recordingDuration = 0;
          this.recordingInterval = window.setInterval(
            () => {
              this.recordingDuration++;
              if (recordingStatusDisplay) {
                recordingStatusDisplay.textContent = formatTime(this.recordingDuration)
              }
            },
            1000,
          );
        }
        
        if (recordingStatusDisplay) {
          this.recordingDuration = 0;
          recordingStatusDisplay.textContent = formatTime(this.recordingDuration);
          recordingStatusDisplay.classList.remove("hidden");
        }

        this.mediaRecorder.ondataavailable = (event) => {
          const chunk = event.data;
          audioChunksUploader.addToQueue(chunk);
        };
        this.mediaRecorder.onstop = () => {
          audioChannel.informRecordingDone({
            recordingId: this.recordingId
          });
        };

        // Start recording with a 1-second interval, and inform the UI of the recording state.
        this.mediaRecorder.start(1000);
        this.isRecording = true;
        button.classList.add("recording");
      } catch (error) {
        console.error("Error accessing the microphone", error);
      }
    } else {
      if (this.recordingInterval) {
        clearInterval(this.recordingInterval);
        this.recordingInterval = undefined;
        const recordingStatusDisplay = document.getElementById("recording-status-display");
        if (recordingStatusDisplay) {
          recordingStatusDisplay.textContent = "";
          recordingStatusDisplay.classList.add("hidden");
        }
      }
      this.mediaRecorder.requestData();
      this.mediaRecorder.stop();
      this.isRecording = false;
      button.classList.remove("recording");
    }
    
    button.innerText = button.classList.contains("recording")
      ? "Stop"
      : "Record";
    }

  // triggerFileInput(event) {
  //   event.preventDefault();
  //   const lectureId = this.uploadRecordingFormTarget.dataset.lectureId;
  //   const fileInput = this.recordingInputTarget;

  //   // console.log(fileInput);
    
  //   fileInput.onchange = (event) => {
  //     const file = event.target.files[0];
  //     console.log(file);

  //     if (file == null) {
  //       return;
  //     }

  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       const base64Data = reader.result.split(',')[1];
  //       this.stimulate('Recordings#upload', {
  //         data: base64Data,
  //         name: file.name,
  //         type: file.type,
  //         lectureId: lectureId
  //       });
  //     };
  //     reader.readAsDataURL(file);
  //   };

  //   fileInput.click();
  // }

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
  
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = secs.toString().padStart(2, '0');
  
    if (hours > 0) {
      const formattedHours = hours.toString().padStart(2, '0');
      return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    } else {
      return `${formattedMinutes}:${formattedSeconds}`;
    }
  }
}
