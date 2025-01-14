# frozen_string_literal: true

class MakeChatNameOptional < ActiveRecord::Migration[7.1]
	def change
		change_column_null :chats, :name, true
	end
end
