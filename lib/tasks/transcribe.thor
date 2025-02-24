# frozen_string_literal: true

require_relative '../../config/environment'
require 'thor'

class Transcribe < Thor
	desc 'transcribe FILE', 'Transcribe the (.webm) file at the given location.'
	method_option :file, type: :string, required: true
	def webm
		filename = options[:file]
		File.open(filename, 'rb') do |file|
			puts ''
			puts "Found file: #{filename}"
			puts "Size: #{file.size}"
			puts 'Invoke the transcription service here!'
			puts ''
		end
		# 	institution = Institution.create(name: name)
		# 	if institution.persisted?
		# 		puts "Institution '#{institution.name}' has been successfully onboarded with ID: #{institution.id}"
		# 	else
		# 		puts "Failed to onboard institution. Errors: #{institution.errors.full_messages.join(', ')}"
		# 	end
	end
end
