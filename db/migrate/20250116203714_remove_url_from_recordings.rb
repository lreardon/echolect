# frozen_string_literal: true

class RemoveUrlFromRecordings < ActiveRecord::Migration[7.1]
	def change
		remove_column :recordings, :url, :string
	end
end
