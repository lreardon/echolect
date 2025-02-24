
import audioChannel from "../channels/audio_channel";
import QueueProcessor from "../classes/queue_processor";
import ApplicationController from "./application_controller";

export default class extends ApplicationController {
  static targets = ["recordingButton", "recordingInput", "uploadRecordingForm"];

  declare isRecording: boolean;
  declare mediaRecorder: MediaRecorder;
  declare recordingButtonTarget: HTMLButtonElement;
  // private recordingInputTarget: HTMLInputElement;

  initialize() {
    this.isRecording = false;
  }

  async toggleRecording() {
    const button = this.recordingButtonTarget;
    const lectureId = this.recordingButtonTarget.dataset.lectureId;
    if (!this.isRecording) {
      try {
        // //* Set options
        // // const options = { mimeType: 'audio/ogg' };
        // let options;
        // if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) {
        //   options = { mimeType: "audio/ogg;codecs=opus" };
        // } else if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        //   options = { mimeType: "audio/webm;codecs=opus" };
        // } else {
        //   console.warn(
        //     "Neither Ogg Opus nor WebM Opus are supported, using default codec"
        //   );
        //   options = {};
        // }
        const timestamp = new Date().toISOString();

        const audioChunksUploader = new QueueProcessor(
          new Array<Blob>(),
          async (chunk: Blob) => {
            try {
              const reader = new FileReader()
              reader.onload = (e) => {
                  const base64data = reader.result

                  if (base64data) {
                    const encodingData = base64data.toString().split(',')[0];
                    const base64String = base64data.toString().split(',')[1];
                    audioChannel.sendAudioChunk(lectureId, timestamp, encodingData, base64String);
                  }
                  
              }
              reader.onerror = () => {                
                  console.log('error')
              }
              reader.readAsDataURL(chunk)
              
              // audioChannel.sendAudioChunk(lectureId, timestamp, chunk);
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

        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.ondataavailable = (event) => {
          const chunk = event.data;
          audioChunksUploader.addToQueue(chunk);
        };

        this.mediaRecorder.start(1000);
        this.isRecording = true;
        button.classList.add("recording");
      } catch (error) {
        console.error("Error accessing the microphone", error);
      }
    } else {
      // this.mediaRecorder.requestData();
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
}
