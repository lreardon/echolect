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

  async initializeRecording(opts: {
    recordingId: String,
    lectureId: String,
  }) {
    const recordingId = opts.recordingId;
    const lectureId = opts.lectureId;
    this.perform('initialize_recording', {
      recordingId: recordingId,
      lectureId: lectureId,
    });
  },

  async sendAudioChunk(opts: {
    lectureId: String,
    recordingId: String,
    timestamp: String,
    encodingData: String,
    base64String: String,
    chunkNumber: Number,
  }) {
    const lectureId = opts.lectureId;
    const recordingId = opts.recordingId;
    const timestamp = opts.timestamp;
    const encodingData = opts.encodingData;
    const base64String = opts.base64String;
    const chunkNumber = opts.chunkNumber;
    this.perform('receive_chunk', {
      lectureId: lectureId,
      recordingId: recordingId,
      timestamp: timestamp,
      encodingData: encodingData,
      audioData: base64String,
      chunkNumber: chunkNumber,
    });
  },

  async informRecordingDone(opts: {
    recordingId: String,
    lectureId: String,
  }) {
    const recordingId = opts.recordingId;
    this.perform('transfer_recording_to_object_storage_and_transcribe', {
      recordingId: recordingId,
    });

    // connectToLectureRecordingChannel(opts.lectureId);
    // console.log('connected');
    // await this.perform('schedule_recording_transcription', {
    //   recordingId: recordingId,
    // });
    // console.log('transcribe scheduled');
  },

	processAudio(recordingId: String) {
		this.perform('process', {
      recordingId: recordingId,
    });
	},

  uploadRecording(file: any) {
    console.log(file);
    const formData = new FormData();
    formData.append('audio[file]', file);

    console.log(formData);

   this.perform('upload', {
    recording: formData,
  });
  }
});

export default audioChannel;