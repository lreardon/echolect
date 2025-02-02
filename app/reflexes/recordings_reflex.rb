# frozen_string_literal: true

class RecordingsReflex < ApplicationReflex
	def upload(params)
		puts params
		lecture_id = params[:lecture_id]
		file_data = Base64.decode64(params[:data])

		puts lecture_id
		puts file_data

		temp_file = Tempfile.new(['recording', '.mp3'])
		temp_file.binmode
		temp_file.write(file_data)
		temp_file.rewind

		lecture = Lecture.find(lecture_id)
		recording = Recording.new(lecture: lecture)
		recording.audio_file.attach(
			io: temp_file,
			filename: params[:name],
			content_type: params[:type]
		)

		puts recording
		recording.save

		# morph :none
	end
end
