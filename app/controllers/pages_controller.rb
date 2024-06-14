# frozen_string_literal: true

class PagesController < ApplicationController
	before_action :authenticate_user!

	def home; end

	def offline
		render 'offline', layout: false
	end
end
