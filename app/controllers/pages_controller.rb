# frozen_string_literal: true

class PagesController < ApplicationController
	before_action :authenticate_user!

	def home
		@messages = Message.order(created_at: :desc).limit(5)
		@message = current_user.messages.build
	end
end
