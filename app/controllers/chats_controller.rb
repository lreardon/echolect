# frozen_string_literal: true

class ChatsController < ApplicationController
	before_action :authenticate_user!

	def show
		permitted_params = params.permit(:id)

		@chat = Chat.find(permitted_params[:id])

		render 'chats/show' # Technically not necessary, as this is inferred from the action name.
	end
end
