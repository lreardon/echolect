# frozen_string_literal: true

# == Schema Information
#
# Table name: chat_memberships
#
#  id            :uuid             not null, primary key
#  good_standing :boolean          default(TRUE)
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  chat_id       :uuid             not null
#  user_id       :uuid             not null
#
# Indexes
#
#  index_chat_memberships_on_chat_id              (chat_id)
#  index_chat_memberships_on_user_id              (user_id)
#  index_chat_memberships_on_user_id_and_chat_id  (user_id,chat_id) UNIQUE
#
class ChatMembership < ApplicationRecord
	belongs_to :user
	belongs_to :chat
end
