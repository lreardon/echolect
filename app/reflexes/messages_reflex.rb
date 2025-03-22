# frozen_string_literal: true

class MessagesReflex < ApplicationReflex
	def create
		message_params = params.require(:message).permit(:chat_id, :body)
		chat_id = message_params[:chat_id]
		# body = message_params[:body]

		current_user.messages.create(message_params)

		cable_ready["chat:#{chat_id}"]
			.inner_html(
				"#chat-#{chat_id}-messages",
				html: render(partial: 'chats/chat_messages',	locals: { messages: Chat.find(chat_id).messages })
			)
			.broadcast
	end
end
