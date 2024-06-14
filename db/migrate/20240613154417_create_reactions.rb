# frozen_string_literal: true

class CreateReactions < ActiveRecord::Migration[7.1]
	def change
		create_table :reactions, id: :uuid do |t|
			t.string :emoji

			t.references :user, null: false, foreign_key: true, type: :uuid, index: true
			t.references :chat, null: false, foreign_key: true, type: :uuid, index: true

			t.timestamps
		end
	end
end
