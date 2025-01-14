# frozen_string_literal: true

# == Schema Information
#
# Table name: institutional_affiliations
#
#  id             :uuid             not null, primary key
#  lecturer       :boolean          default(FALSE)
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  institution_id :uuid             not null
#  user_id        :uuid             not null
#
# Indexes
#
#  index_institutional_affiliations_on_institution_id  (institution_id)
#  index_institutional_affiliations_on_lecturer        (lecturer)
#  index_institutional_affiliations_on_user_id         (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (institution_id => institutions.id)
#  fk_rails_...  (user_id => users.id)
#
class InstitutionalAffiliation < ApplicationRecord
	belongs_to :institution
	belongs_to :user

	scope :lecturers, -> { where(lecturer: true) }

	def lecturer?
		lecturer
	end
end
