# frozen_string_literal: true

class AddCodeToChats < ActiveRecord::Migration[7.1]
	def change
		add_column :chats, :code, :string

		# Step 2: Backfill existing records with unique codes
		Chat.reset_column_information

		Chat.find_each do |chat|
			chat.update(code: SecureRandom.alphanumeric(8))
		end

		# Step 3: Change the column to enforce the null constraint
		change_column_null :chats, :code, false

		# Step 4: Add the unique index
		add_index :chats, :code, unique: true
	end
end
