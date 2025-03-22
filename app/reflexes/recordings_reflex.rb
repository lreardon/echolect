# frozen_string_literal: true

class RecordingsReflex < ApplicationReflex
	# def upload(params)
	# 	puts params
	# 	lecture_id = params[:lecture_id]
	# 	file_data = Base64.decode64(params[:data])

	# 	puts lecture_id
	# 	puts file_data

	# 	temp_file = Tempfile.new(['recording', '.mp3'])
	# 	temp_file.binmode
	# 	temp_file.write(file_data)
	# 	temp_file.rewind

	# 	lecture = Lecture.find(lecture_id)
	# 	recording = Recording.new(lecture: lecture)
	# 	recording.audio_file.attach(
	# 		io: temp_file,
	# 		filename: params[:name],
	# 		content_type: params[:type]
	# 	)

	# 	puts recording
	# 	recording.save

	# 	# morph :none
	# end

	def transcribe
		lecture_id = element.dataset.lecture_id
		recording_id = element.dataset.recording_id
		recording = recording_id.present? ? Recording.find(recording_id) : Lecture.find(lecture_id).recording
		TranscribeRecordingJob.perform_now(recording)

		# morph :none
	end

	def broadcast_transcription_complete(data)
		puts 'BROADCASTING TRANSCRIPTION COMPLETE'
		puts data
		transcription_url = data[:transcription_url]
		recording_id = data[:recording_id]

		owner = Recording.find(recording_id).lecture.user
		puts owner
		puts transcription_url
		# transcription_url = url_for(data[:transcription_url])
		# transcription_url
	end
end
