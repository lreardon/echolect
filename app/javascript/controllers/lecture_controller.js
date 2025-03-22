// app/javascript/controllers/lecture_controller.js
import { Controller } from "@hotwired/stimulus"
import connectToLectureRecordingChannel from "../channels/lecture_recording_channel"

export default class extends Controller {
  static values = { id: String }
  
  connect() {
    const lectureId = this.idValue
    if (lectureId) { 
      this.channelSubscription = connectToLectureRecordingChannel(lectureId)
    }
  }
  
  disconnect() {
    if (this.channelSubscription) {
      this.channelSubscription.unsubscribe()
    }
  }
}