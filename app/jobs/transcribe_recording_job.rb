# frozen_string_literal: true

class TranscribeRecordingJob < ApplicationJob
	queue_as :default

	def perform(recording)
		puts recording.audio_file

		raise UnimplementedError, 'Recording transcription is not implemented!'
	end
end
