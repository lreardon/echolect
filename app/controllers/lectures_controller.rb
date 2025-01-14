# frozen_string_literal: true

class LecturesController < ApplicationController
	before_action :set_lecture, only: [:show]

	private

	def set_lecture
		@lecture = Lecture.find(params[:id])
	end
end
