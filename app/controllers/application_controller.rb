# frozen_string_literal: true

class ApplicationController < ActionController::Base
	include CableReady::Broadcaster

	def authenticate_user!
		auth_action = catch(:warden) do
			super
			return true
		end

		flash.delete(:alert) if auth_action.is_a?(Hash) && auth_action[:action] == :unauthenticated

		throw(:warden, auth_action)
	end
end
