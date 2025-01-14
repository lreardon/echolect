# frozen_string_literal: true

class AddColumnActiveInstitutionIdToUsers < ActiveRecord::Migration[7.1]
	def change
		add_column :users, :active_institution_id, :uuid
		add_index :users, :active_institution_id
	end
end
