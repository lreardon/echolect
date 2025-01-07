# frozen_string_literal: true

class CreateInstitutions < ActiveRecord::Migration[7.1]
	def change
		create_table :institutions, id: :uuid do |t|
			t.string :name

			t.timestamps
		end
	end
end
