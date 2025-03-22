# frozen_string_literal: true

# == Schema Information
#
# Table name: recordings
#
#  id         :uuid             not null, primary key
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  lecture_id :uuid
#
# Indexes
#
#  index_recordings_on_lecture_id  (lecture_id)
#
# Foreign Keys
#
#  fk_rails_...  (lecture_id => lectures.id)
#
class Recording < ApplicationRecord
	belongs_to :lecture
	has_one_attached :audio_file
	has_one_attached :transcription

	# def audio_file_url
	# 	audio_file.url.gsub('minio:9000', 'localhost:9000')
	# end
	#
	def audio_file_internal_url
		audio_file.url.gsub('localhost:9000', 'minio:9000')
	end

	def transcription_internal_url
		transcription.url.gsub('localhost:9000', 'minio:9000')
	end

	def notify_transcription_complete
		puts 'NOTIFYING THAT DONE'
		html = ApplicationController.renderer.render(
			partial: 'lectures/recording_panel',
			locals: { lecture: lecture }
		)
		puts html

		cable_ready["lecture:#{lecture.id}:recording"].morph(
			selector: '#lecture-recording-panel',
			html: html
		).dispatch_event(
			name: 'transcription-complete',
			detail: {
				recording_id: id,
				transcription_url: transcription.url
			}
		).broadcast
	end
end
