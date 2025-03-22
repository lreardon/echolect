import consumer from "./consumer";

export default function connectToChatChannel(chatId) {
  consumer.subscriptions.create({
    channel: 'ChatChannel',
    chat_id: chatId
  }, {
    connected() {
      console.log(`Connecting to chat Channel for chat ${chatId}`)
      // Called when the subscription is ready for use on the server
    },

    disconnected() {
      // Called when the subscription has been terminated by the server
    },

    received(data) {
      console.warn(data);
      if (data.cableReady) CableReady.perform(data.operations);
    }
  });
}
