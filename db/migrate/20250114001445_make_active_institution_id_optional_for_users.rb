# frozen_string_literal: true

class MakeActiveInstitutionIdOptionalForUsers < ActiveRecord::Migration[7.1]
	def change
		change_column_null :users, :active_institution_id, true
	end
end
