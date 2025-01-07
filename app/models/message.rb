# frozen_string_literal: true

# == Schema Information
#
# Table name: messages
#
#  id         :uuid             not null, primary key
#  body       :text
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  chat_id    :uuid
#  user_id    :uuid             not null
#
# Indexes
#
#  index_messages_on_chat_id  (chat_id)
#  index_messages_on_user_id  (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (chat_id => chats.id)
#  fk_rails_...  (user_id => users.id)
#
class Message < ApplicationRecord
	belongs_to :user
	belongs_to :chat
	validates :body, presence: true, length: { maximum: 1000 }

	after_create_commit :broadcast_self_as_json_to_messages_channel
	after_destroy_commit :broadcast_destroy

	def broadcast_self_as_json_to_messages_channel
		ActionCable.server.broadcast('MessagesChannel', { message: to_json })
	end
	# def broadcast_create
	# 	# Broadcast to all users the message partial
	# 	broadcast_append_to 'messages',
	# 		partial: 'messages/message',
	# 		locals: { message: self, display_controls: false }

	# 	# Broadcast the user controls to: message_id_user_id_controls
	# 	broadcast_replace_to "user_#{user.id}",
	# 		target: "message_#{id}_controls",
	# 		partial: 'messages/controls',
	# 		locals: { message: self }
	# end

	def broadcast_destroy
		# Broadcast to all users the message partial
		broadcast_remove_to 'messages'
	end
end
