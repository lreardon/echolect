import transcriptionChannel from "../channels/transcription_channel";
import ApplicationController from "./application_controller";

export default class extends ApplicationController {
  static targets = ["transcriptionButton"];

  initialize() {
    // this.isRecording = false;
    // this.mediaRecorder = null;
    // this.audioChunks = [];
  }

  // async downloadTranscription() {
  //   const button = this.transcriptionButtonTarget;
  //   button.classList.toggle("transcribing");
  //   button.setAttribute("disabled", true);
  //   button.innerText = "Transcribing";
  //   await generateAndDownloadTranscription();
  //   button.classList.toggle("transcribing");
  //   button.removeAttribute("disabled");
  //   button.innerText = "Download Transcription";
  // }

  async generateAndDownloadTranscription() {
    await transcriptionChannel.generateTranscription();
    await transcriptionChannel.downloadTranscription();
  }
}
