import consumer from "./consumer";

export default function connectToLectureRecordingChannel(lectureId) {
  consumer.subscriptions.create({
    channel: 'LectureRecordingChannel',
    lecture_id: lectureId
  }, {
    connected() {
      // Called when the subscription is ready for use on the server
      console.log(`Connected to LectureRecordingChannel for lecture ${lectureId}`)
    },
  
    disconnected() {
      // Called when the subscription has been terminated by the server
    },
  
    received(data) {
      console.log(data)
      if (data.cableReady) {
        CableReady.perform(data.operations)
      }

      const transcriptionOp = data.operations.find(op => 
        op.operation === "dispatchEvent" && op.name === "transcription-complete"
      )
      
      if (transcriptionOp) {
        this.handleTranscriptionComplete(transcriptionOp.detail)
      }
    },

    handleTranscriptionComplete(detail) {
      const { recordingId, transcriptionUrl } = detail
      
      // Create download button
      const downloadButton = document.createElement('button')
      downloadButton.className = 'bg-green-600 hover:bg-green-500'
      downloadButton.innerText = 'Download Transcription'
      downloadButton.addEventListener('click', () => {
        window.open(transcriptionUrl, '_blank')
      })

      
      
      // // Find container to append to (adjust selector as needed)
      // const container = document.querySelector('.recording-controls') || 
      //                   document.querySelector('.flex.flex-row.gap-4')
      
      // // Remove any existing download buttons
      // const existingButtons = document.querySelectorAll('.transcription-download-btn')
      // existingButtons.forEach(btn => btn.remove())
      
      // // Add unique class for future reference
      // downloadButton.classList.add('transcription-download-btn')
      
      // // Append to container
      // if (container) {
      //   container.appendChild(downloadButton)
      // } else {
      //   console.error("Could not find container for transcription button")
      // }
    }
  });
}


