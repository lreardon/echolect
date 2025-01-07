# frozen_string_literal: true

class CreateCourses < ActiveRecord::Migration[7.1]
	def change
		create_table :courses, id: :uuid do |t|
			t.string :name

			t.timestamps
		end
	end
end
