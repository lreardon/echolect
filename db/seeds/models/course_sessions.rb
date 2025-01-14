# frozen_string_literal: true

Institution.all.each do |institution|
	CourseSession.create!(name: 'Example', institution: institution)
end
