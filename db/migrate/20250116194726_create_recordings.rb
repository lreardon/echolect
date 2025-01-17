# frozen_string_literal: true

class CreateRecordings < ActiveRecord::Migration[7.1]
	def change
		create_table :recordings, id: :uuid do |t|
			t.belongs_to :lecture, type: :uuid, foreign_key: true
			t.string :url, null: false

			t.timestamps
		end
	end
end
