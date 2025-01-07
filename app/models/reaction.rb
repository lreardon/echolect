# frozen_string_literal: true

# == Schema Information
#
# Table name: reactions
#
#  id         :uuid             not null, primary key
#  emoji      :string
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  chat_id    :uuid             not null
#  user_id    :uuid             not null
#
# Indexes
#
#  index_reactions_on_chat_id  (chat_id)
#  index_reactions_on_user_id  (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (chat_id => chats.id)
#  fk_rails_...  (user_id => users.id)
#
class Reaction < ApplicationRecord
	belongs_to :user
	belongs_to :chat
end
