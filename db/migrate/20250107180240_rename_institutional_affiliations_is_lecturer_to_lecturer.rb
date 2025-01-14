# frozen_string_literal: true

class RenameInstitutionalAffiliationsIsLecturerToLecturer < ActiveRecord::Migration[7.1]
	def change
		rename_column :institutional_affiliations, :is_lecturer, :lecturer
	end
end
