# frozen_string_literal: true

require 'rake'

namespace :audio do
	desc 'Convert OGG file to FLAC format'
	task convert_to_flac: :environment do |_t, args|
		puts 'inside'
		recordings_dir = 'shared/recordings'
		filename = args[:filename] || 'test'
		input_file = "#{recordings_dir}/#{filename}.ogg"
		output_file = "#{recordings_dir}/#{filename}.flac"

		puts input_file

		if File.exist?(input_file)
			puts "Converting #{input_file} to FLAC format..."
			system("ffmpeg -i #{input_file} -c:a flac #{output_file}")

			if $CHILD_STATUS.success?
				puts "Conversion successful. Output file: #{output_file}"
			else
				puts 'Conversion failed. Please check if FFmpeg is installed and the input file is valid.'
			end
		else
			puts "Error: Input file #{input_file} not found."
		end
	end
end
