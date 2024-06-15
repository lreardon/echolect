# frozen_string_literal: true

class ChatsReflex < ApplicationReflex
	def create
		puts "PARAMS"
		puts params
		chat_params = params.require(:chat).permit(:name)
		name = chat_params[:name]

		puts name
		current_user.chats.create(name:)
		current_user.reload

		puts current_user.chats
		puts "\n\n\n\n\n"
		
		morph '#user-created-chats', render(partial: 'chats/chats')
	end

	def delete
		chat = Chat.find(element.dataset.chat_id)
		chat.destroy
		current_user.reload

		morph '#user-created-chats', render(partial: 'chats/chats')
	end

	def join
		chat_params = params.require(:chat).permit(:code)
		code = chat_params[:code]
		chat = Chat.find_by(code:)

		current_user.join_chat(chat, code:)

		current_user.reload

		morph '#user-joined-chats', render(partial: 'chats/joined_chats')
	end
end
