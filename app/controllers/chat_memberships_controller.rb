# frozen_string_literal: true

class ChatMembershipsController < ApplicationController
	def create
		code = params[:code]
		chat = Chat.find_by(code:)

		current_user.join_chat(chat)
	end
end
