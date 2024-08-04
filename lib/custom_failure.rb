# frozen_string_literal: true

# app/lib/custom_failure.rb
class CustomFailure < Devise::FailureApp
	# def redirect
	# 	store_location!
	# 	message = warden_message || :unauthenticated

	# 	# Remove the flash alerts
	# 	flash.delete(:alert)

	# 	redirect_to redirect_url
	# end
end
