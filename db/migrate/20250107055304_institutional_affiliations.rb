# frozen_string_literal: true

class InstitutionalAffiliations < ActiveRecord::Migration[7.1]
	def change
		create_table :institutional_affiliations, id: :uuid do |t|
			t.references :institution, null: false, foreign_key: true, type: :uuid
			t.references :user, null: false, foreign_key: true, type: :uuid

			t.timestamps
		end
	end
end
