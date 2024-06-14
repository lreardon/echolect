# frozen_string_literal: true

class CreateChats < ActiveRecord::Migration[7.1]
	def change
		create_table :chats, id: :uuid do |t|
			t.references :user, null: false, foreign_key: true, type: :uuid, index: true

			t.timestamps
		end

		add_reference :messages, :chat, type: :uuid, foreign_key: true
	end
end
