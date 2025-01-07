# frozen_string_literal: true

class CreateCourseSessions < ActiveRecord::Migration[7.1]
	def change
		create_table :course_sessions, id: :uuid do |t|
			t.string :name

			t.timestamps
		end
	end
end
