# frozen_string_literal: true

class CreateChatMemberships < ActiveRecord::Migration[7.1]
	def change
		create_table :chat_memberships, id: :uuid do |t|
			t.references :user, type: :uuid, null: false, index: true
			t.references :chat, type: :uuid, null: false, index: true
			t.boolean :good_standing, default: true

			t.timestamps
		end

		add_index :chat_memberships, %i[user_id chat_id], unique: true
	end
end
