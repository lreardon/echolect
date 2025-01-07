# frozen_string_literal: true

require_relative '../../config/environment'
require 'thor'

class Institutions < Thor
	desc 'onboard INSTITUTION', 'Onboard a new institution.'
	method_option :name, type: :string, required: true
	def onboard
		name = options[:name]

		institution = Institution.create(name: name)
		if institution.persisted?
			puts "Institution '#{institution.name}' has been successfully onboarded with ID: #{institution.id}"
		else
			puts "Failed to onboard institution. Errors: #{institution.errors.full_messages.join(', ')}"
		end
	end
end
