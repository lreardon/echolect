# frozen_string_literal: true

class AssociationsForLecturersInstitutionsCoursesCourseOfferingsAndCourseSessions < ActiveRecord::Migration[7.1]
	def change
		add_reference :courses, :institution, type: :uuid, foreign_key: true

		add_reference :course_sessions, :institution, type: :uuid, foreign_key: true

		add_reference :course_offerings, :institution, type: :uuid, foreign_key: true
		add_reference :course_offerings, :user, type: :uuid, foreign_key: true
		add_reference :course_offerings, :course, type: :uuid, foreign_key: true
		add_reference :course_offerings, :course_session, type: :uuid, foreign_key: true
	end
end
