# frozen_string_literal: true

class ChatsReflex < ApplicationReflex
	def create
		puts 'CREATING'
		chat_params = params.require(:chat).permit(:name)
		puts chat_params
		unless chat_params
			morph :none
			return
		end

		name = chat_params[:name]
		unless name
			morph :none
			return
		end

		chat = current_user.chats.create(name:)

		unless chat.persisted?
			# flash[:error] = 'Chat could not be created.'
			morph :none
			return
		end

		current_user.reload

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
		unless chat_params
			morph :none
			return
		end

		code = chat_params[:code]
		unless code
			morph :none
			return
		end

		chat = Chat.find_by(code:)
		unless chat
			morph :none
			return
		end

		current_user.join_chat(chat, code:)

		current_user.reload

		morph '#user-joined-chats', render(partial: 'chats/joined_chats')
	end
end
