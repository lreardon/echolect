# frozen_string_literal: true

class MessagesReflex < ApplicationReflex
	def create
		message_params = params.require(:message).permit(:chat_id, :body)
		chat_id = message_params[:chat_id]

		message = current_user.messages.create(message_params)

		cable_ready["chat-#{chat_id}-messages"]
			.prepend("#chat-#{chat_id}-messages", html: render(partial: 'messages/message', locals: { message: }))
			.broadcast
	end
end
