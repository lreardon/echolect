import consumer from "./consumer";

const audioChannel = consumer.subscriptions.create("AudioChannel", {
  connected() {
    console.log("Connected to AudioChannel");
  },

  disconnected() {
    console.log("Disconnected from AudioChannel");
  },

  received(data) {
    console.log("Received data:", data);
  },

  sendAudioData(recordingId, audioData) {
    this.perform('receive', { recordingId: recordingId, audioData: audioData });
  },

	processAudio(recordingId) {
		this.perform('process', { recordingId: recordingId });
	},

  uploadRecording(file) {
    console.log(file);
    const formData = new FormData();
    formData.append('audio[file]', file);

    console.log(formData);

   this.perform('upload', { recording: formData });
  }
});

export default audioChannel;