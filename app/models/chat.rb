# frozen_string_literal: true

# == Schema Information
#
# Table name: chats
#
#  id         :uuid             not null, primary key
#  code       :string           not null
#  name       :string
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  user_id    :uuid             not null
#
# Indexes
#
#  index_chats_on_code     (code) UNIQUE
#  index_chats_on_user_id  (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
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

	validates :name, presence: true, length: { maximum: 50 }
end
