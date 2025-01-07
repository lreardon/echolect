# frozen_string_literal: true

class RemoveUsernameFromUsers < ActiveRecord::Migration[7.1]
	def change
		remove_column :users, :username
	end
end
