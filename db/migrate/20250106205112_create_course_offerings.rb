# frozen_string_literal: true

class CreateCourseOfferings < ActiveRecord::Migration[7.1]
	def change
		create_table :course_offerings, id: :uuid do |t|
			t.timestamps
		end
	end
end
