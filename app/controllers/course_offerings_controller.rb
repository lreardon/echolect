# frozen_string_literal: true

class CourseOfferingsController < ApplicationController
	before_action :set_course_offering, only: %i[show]

	private

	def set_course_offering
		@course_offering = CourseOffering.find(params[:id])
	end
end
