# frozen_string_literal: true

# == Schema Information
#
# Table name: courses
#
#  id             :uuid             not null, primary key
#  name           :string
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  institution_id :uuid
#
# Indexes
#
#  index_courses_on_institution_id  (institution_id)
#
# Foreign Keys
#
#  fk_rails_...  (institution_id => institutions.id)
#
class Course < ApplicationRecord
	belongs_to :institution

	has_many :course_sessions, through: :course_offerings
	has_many :course_offerings
end
