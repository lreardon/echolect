# frozen_string_literal: true

class User < ApplicationRecord
	# Include default devise modules. Others available are:
	# :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
	devise :database_authenticatable, :registerable,
		:recoverable, :rememberable, :validatable

	has_many :chats, dependent: :destroy
	has_many :chat_memberships, dependent: :destroy
	has_many :joined_chats, through: :chat_memberships, source: :chat
	has_many :messages, dependent: :destroy
	has_many :reactions, dependent: :destroy

	def name
		"#{first_name} #{last_name}"
	end

	def join_chat(chat, code: :code)
		return unless chat.access_code == code

		joined_chats << chat
	end

	def owns_chat(chat)
		chat.user_id == id
	end
end
