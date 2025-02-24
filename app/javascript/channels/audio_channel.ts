import consumer from "./consumer";

const audioChannel = consumer.subscriptions.create("AudioChannel", {
  connected() {
    console.log("Connected to AudioChannel");
  },

  disconnected() {
    console.log("Disconnected from AudioChannel");
  },

  received(data: Blob) {
    console.log("Received data:", data);
  },

  // sendAudioData(recordingId, audioData) {
  //   console.log("Sending audio data:", recordingId, audioData);
  //   this.perform('receive', { recordingId: recordingId, audioData: audioData });
  // },

  async sendAudioChunk(lectureId: String, timestamp: String, encodingData: String, base64String: String) {
    this.perform('receive_chunk', { lectureId: lectureId, timestamp: timestamp, encodingData: encodingData, audioData: base64String });
  },

	processAudio(recordingId: String) {
		this.perform('process', { recordingId: recordingId });
	},

  uploadRecording(file: any) {
    console.log(file);
    const formData = new FormData();
    formData.append('audio[file]', file);

    console.log(formData);

   this.perform('upload', { recording: formData });
  }
});

export default audioChannel;