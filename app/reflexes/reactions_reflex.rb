# frozen_string_literal: true

class ReactionsReflex < ApplicationReflex
	def create
		reaction = element.dataset.reaction
		chat_id = element.dataset.chat_id

		current_user.reactions.create(emoji: reaction, chat_id: element.dataset.chat_id)

		reactions = Chat.find(chat_id).reactions

		cable_ready["chat:#{chat_id}"]
			.inner_html(
				"#chat-#{chat_id}-reactions",
				html: render(partial: 'chats/chat_reactions',	locals: { reactions: reactions })
			)
			.broadcast
	end
end
