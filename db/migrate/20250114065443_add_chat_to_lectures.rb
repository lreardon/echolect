# frozen_string_literal: true

class AddChatToLectures < ActiveRecord::Migration[7.1]
	def change
		add_column :lectures, :chat_id, :uuid
	end
end
