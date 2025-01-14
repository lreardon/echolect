# frozen_string_literal: true

class UsersReflex < ApplicationReflex
	def update_active_institution
		institution_id = element.dataset.institution_id
		current_user.update(active_institution_id: institution_id)
		# morph :page
	end
end
