# frozen_string_literal: true

class MoveIsLecturerToInstitutionalAffiliation < ActiveRecord::Migration[7.1]
	def change
		add_column :institutional_affiliations, :is_lecturer, :boolean, default: false

		# Step 2: Copy the values from the users table to the institutional_affiliations table
		reversible do |dir|
			dir.up do
				execute <<-SQL.squish
      UPDATE institutional_affiliations
      SET is_lecturer = users.is_lecturer
      FROM users
      WHERE institutional_affiliations.user_id = users.id
				SQL
			end
		end

		# Step 3: Add an index for the is_lecturer column
		add_index :institutional_affiliations, :is_lecturer

		# Step 4: Remove the is_lecturer column from the users table
		remove_column :users, :is_lecturer, :boolean
	end
end
