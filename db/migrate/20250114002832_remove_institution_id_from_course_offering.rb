# frozen_string_literal: true

class RemoveInstitutionIdFromCourseOffering < ActiveRecord::Migration[7.1]
	def change
		remove_column :course_offerings, :institution_id
	end
end
