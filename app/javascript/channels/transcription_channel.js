import consumer from "./consumer";

const transcriptionChannel = consumer.subscriptions.create(
  "TranscriptionChannel",
  {
    connected() {
      console.log("Connected to AudioChannel");
    },

    disconnected() {
      console.log("Disconnected from AudioChannel");
    },

    received(data) {
      console.log("Received data:", data);
    },

    async generateTranscription() {
      await new Promise((resolve) => setTimeout(resolve, 3000));
    },

    async downloadTranscription() {
      await new Promise((resolve) => setTimeout(resolve, 3000));
    },

    // processAudio(recordingId) {
    //   this.perform("process", { recordingId: recordingId });
    // },
  }
);

export default transcriptionChannel;
