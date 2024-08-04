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

  sendAudioData(audioData) {
    this.perform('receive', { audio_data: audioData });
  },
});

export default audioChannel;