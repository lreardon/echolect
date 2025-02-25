# frozen_string_literal: true

require 'rake'
require 'fileutils'

# app/channels/audio_channel.rb
class AudioChannel < ApplicationCable::Channel
	RECORDINGS_DIR = "#{Rails.root}/shared/recordings".freeze

	def subscribed
		stream_from 'audio_channel'
	end

	# def receive(params)
	# 	recording_id = params['recordingId']
	# 	audio_data = params['audioData']
	# 	puts "received data: #{audio_data.length} bytes"

	# 	File.open("#{RECORDINGS_DIR}/#{recording_id}/#{recording_id}.ogg", 'ab') do |file|
	# 		file.write(Base64.decode64(data))
	# 		puts "wrote data: #{data.length} bytes"
	# 	end
	# end

	def initialize_recording(params)
		recording_id = params['recordingId']
		lecture_id = params['lectureId']

		recording = Recording.create(
			id: recording_id,
			lecture_id: lecture_id
		)
		puts recording
		puts recording.audio_file
		puts recording.audio_file_url
	end

	def receive_chunk(params)
		lecture_id = params['lectureId']
		# timestamp = params['timestamp']
		recording_id = params['recordingId']
		# encoding_data = params['encodingData']
		audio_data = params['audioData']

		# recording = Recording.find(recording_id)
		# puts 'RECORDING'
		# puts recording
		# puts recording.audio_file

		decoded_data = Base64.decode64(audio_data)

		recording_path = "#{RECORDINGS_DIR}/lectures/#{lecture_id}/recordings/#{recording_id}/audio.webm"
		dirname = File.dirname(recording_path)
		FileUtils.mkdir_p(dirname)

		File.open(recording_path, 'ab') do |file|
			# file.write(encoding_data) if file.blank?
			file.write(decoded_data)
		end
	end

	def transfer_recording_to_object_storage(params)
		recording_id = params['recordingId']

		recording = Recording.find(recording_id)
		lecture_id = recording.lecture_id
		recording_path = "#{RECORDINGS_DIR}/lectures/#{lecture_id}/recordings/#{recording_id}/audio.webm"
		if File.exist?(recording_path)
			File.open(recording_path) do |file|
				puts 'here the file'
				puts file
				recording.audio_file.attach(
					io: file,
					filename: 'audio.webm',
					content_type: 'audio/webm'
				)
				puts 'attached weeeeeeeee'
			end
			puts 'did something after'
		else
			puts 'File not found!'
		end
	end

	def process(params)
		recording_id = params['recordingId']
		convert_ogg_to_flac(
			directory: "#{RECORDINGS_DIR}/#{recording_id}",
			filestem: recording_id
		)
	end

	def unsubscribed
		# Any cleanup needed when channel is unsubscribed
	end

	def upload(form_data)
		puts form_data
		audio_data = form_data['recording']
		file = Base64.decode64(audio_data)
		puts file
	end

	private

	def convert_ogg_to_flac(directory:, filestem:)
		input_file = "#{directory}/#{filestem}.ogg"
		output_staging_file = "#{directory}/tmp/#{filestem}.flac" # Used so that file presence is detected by the audiotext listener only once file is complete!
		output_file = "#{directory}/#{filestem}.flac"

		if File.exist?(input_file)
			puts "Converting #{input_file} to FLAC format..."
			system("ffmpeg -i #{input_file} -c:a flac -sample_fmt s16 #{output_staging_file}")

			if $CHILD_STATUS.success?
				FileUtils.mv(output_staging_file, output_file)
				FileUtils.rm_f(output_staging_file)
				puts "Conversion successful. Output file: #{output_file}"
			else
				puts 'Conversion failed. Please check if FFmpeg is installed and the input file is valid.'
			end
		else
			puts "Error: Input file #{input_file} not found."
		end
	end
end
