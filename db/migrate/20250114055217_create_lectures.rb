# frozen_string_literal: true

class CreateLectures < ActiveRecord::Migration[7.1]
	def change
		create_table :lectures, id: :uuid do |t|
			t.uuid :course_offering_id
			t.datetime :start_time

			t.timestamps
		end
	end
end
