# frozen_string_literal: true

class CreateMessages < ActiveRecord::Migration[7.0]
	def change
		create_table :messages, id: :uuid do |t|
			t.text :body
			t.references :user, null: false, foreign_key: true, type: :uuid

			t.timestamps
		end
	end
end
