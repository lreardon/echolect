# frozen_string_literal: true

class AddIsSpeakerToUsers < ActiveRecord::Migration[7.1]
	def change
		add_column :users, :is_lecturer, :boolean, null: false, default: false
	end
end
