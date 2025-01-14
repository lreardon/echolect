# frozen_string_literal: true

require 'faker'

Institution.all.each do |institution|
	8.times do |_n|
		institution.create_course(name: Faker::Educator.course_name)
	end
end

# l = User.find_by(email: 'leland6925@gmail.com')
