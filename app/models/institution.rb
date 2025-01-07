# frozen_string_literal: true

# == Schema Information
#
# Table name: institutions
#
#  id         :uuid             not null, primary key
#  name       :string
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
class Institution < ApplicationRecord
	has_many :institutional_affiliations, dependent: :destroy
	has_many :users, through: :institutional_affiliations
	has_many :lecturer_institutional_affiliations, -> { lecturers }, class_name: 'InstitutionalAffiliation'
	has_many :lecturers, through: :lecturer_institutional_affiliations, source: :user

	has_many :courses
	has_many :course_sessions
	has_many :course_offerings
end
