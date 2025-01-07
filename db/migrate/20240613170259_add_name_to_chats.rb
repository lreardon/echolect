# frozen_string_literal: true

class AddNameToChats < ActiveRecord::Migration[7.1]
	def change
		add_column :chats, :name, :string
	end
end
