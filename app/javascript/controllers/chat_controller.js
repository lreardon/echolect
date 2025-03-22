// app/javascript/controllers/lecture_controller.js
import { Controller } from "@hotwired/stimulus"
import connectToChatChannel from "../channels/chat_channel"

export default class extends Controller {
  static values = { id: String }
  
  connect() {
      const chatId = this.idValue
      if (chatId) { 
      this.channelSubscription = connectToChatChannel(chatId)
    }
  }
  
  disconnect() {
    if (this.channelSubscription) {
      this.channelSubscription.unsubscribe()
    }
  }
}