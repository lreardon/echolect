# frozen_string_literal: true

class RecordingChannel < ApplicationCable::Channel
	def subscribed
		recording_id = params[:recording_id]
		stream_from "recording_#{recording_id}"
	end

	def unsubscribed
		# Any cleanup needed when channel is unsubscribed
	end
end
