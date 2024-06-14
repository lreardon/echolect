# frozen_string_literal: true

class ReactionsReflex < ApplicationReflex
	def create
		reaction = element.dataset.reaction
		chat_id = element.dataset.chat_id

		reaction = current_user.reactions.create(emoji: reaction, chat_id: element.dataset.chat_id)

		cable_ready["chat-#{chat_id}-reactions"]
			.append("#chat-#{chat_id}-reactions", html: render(partial: 'chats/reaction', locals: { reaction: }))
			.broadcast
	end
end
