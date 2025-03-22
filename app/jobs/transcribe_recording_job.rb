# frozen_string_literal: true

require "#{Rails.root}/services/transcription_service"
require 'fileutils'

class TranscribeRecordingJob < ApplicationJob
	queue_as :default

	def perform(recording)
		ts = TranscriptionService.new
		response = ts.transcribe(recording.audio_file_internal_url)

		transcription_path = "#{Rails.root}/shared/recordings/lectures/#{recording.lecture_id}/recordings/#{recording.id}/transcription.json"
		File.write(transcription_path, JSON.pretty_generate(response))

		File.open(transcription_path) do |file|
			recording.transcription.attach(file)
		end

		recording.notify_transcription_complete
	end
end
