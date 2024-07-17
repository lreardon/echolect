# frozen_string_literal: true

class UserMailer < ApplicationMailer
	default from: 'postmaster@echolect.co'

	def welcome_email
		@user = params[:user]
		@url  = 'http://example.com/login'
		mail(to: @user.email, subject: 'Welcome to My Awesome Site')
	end
end
