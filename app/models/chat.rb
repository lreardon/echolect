# frozen_string_literal: true

class Chat < ApplicationRecord
	include Codeable

	belongs_to :user
	has_many :messages, dependent: :destroy
	has_many :reactions, dependent: :destroy
	has_many :chat_memberships, dependent: :destroy
	has_many :members, through: :chat_memberships, source: :user
	has_many :messaging_users, through: :messages
	has_many :reacting_users, through: :reactions

	has_code as: :access_code, length: 8
end
