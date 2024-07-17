# frozen_string_literal: true

class ApplicationController < ActionController::Base
	include CableReady::Broadcaster

	def authenticate_user!
		super
		flash.delete(:alert)
	end
end
