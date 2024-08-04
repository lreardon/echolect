
import audioChannel from "../channels/audio_channel";
import ApplicationController from './application_controller';

export default class extends ApplicationController {
	static targets = ["recordingButton"]

	initialize() {
    this.isRecording = false;
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  async toggleRecording() {
		const button = this.recordingButtonTarget;
		button.classList.toggle('recording');
		if (!this.isRecording) {
      // Request access to the microphone
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
				// const options = { mimeType: 'audio/ogg' };
				let options;
				if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
					options = { mimeType: 'audio/ogg;codecs=opus' };
				} else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
					options = { mimeType: 'audio/webm;codecs=opus' };
				} else {
					console.warn('Neither Ogg Opus nor WebM Opus are supported, using default codec');
					options = {};
      	}

        this.mediaRecorder = new MediaRecorder(stream);

        this.mediaRecorder.ondataavailable = event => {
					// console.log('DATA AVAILABLE')
          this.audioChunks.push(event.data);

					const reader = new FileReader();
					reader.onloadend = () => {
						const base64data = reader.result.split(',')[1];
						// console.log('SENDING DATA!')
						audioChannel.sendAudioData(base64data);
					};

					reader.readAsDataURL(event.data);
        };

        this.mediaRecorder.onstop = () => {
          const audioBlob = new Blob(this.audioChunks, { 'type' : 'audio/ogg; codecs=opus' });
          const audioUrl = URL.createObjectURL(audioBlob);
          // const audio = new Audio(audioUrl);
          // audio.play(); // Example action: play the recorded audio
					const downloadLink = document.createElement('a');
					downloadLink.href = audioUrl;
					downloadLink.download = 'recorded_audio.ogg'; // You can specify any filename you want
					document.body.appendChild(downloadLink); // Append link to body
					downloadLink.click(); // Programmatically click the link to trigger the download
					document.body.removeChild(downloadLink); // Optionally, remove the link after triggering the download
					URL.revokeObjectURL(audioUrl); // Clean up the URL object
          this.audioChunks = []; // Reset chunks for next recording
        };
        this.mediaRecorder.start();
        this.isRecording = true;
        button.innerText = 'Stop';
      } catch (error) {
        console.error("Error accessing the microphone", error);
      }
    } else {
      // Stop the recording
      this.mediaRecorder.stop();
      this.isRecording = false;
      button.innerText = 'Record';
    }
		button.innerText = button.classList.contains('recording') ? 'Stop' : 'Record';
  }
}