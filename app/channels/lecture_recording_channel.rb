# frozen_string_literal: true

class LectureRecordingChannel < ApplicationCable::Channel
	def subscribed
		stream_from "lecture:#{params[:lecture_id]}:recording"
	end

	def unsubscribed
		# Any cleanup needed when channel is unsubscribed
	end
end
