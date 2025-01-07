# frozen_string_literal: true

require 'faker'

Institution.all.each do |institution|
	number_of_students = 7

	user_indices_to_make_lecturers = (0..number_of_students).to_a.sample(2)
	number_of_students.times do |i|
		user = User.create!(
			first_name: Faker::Name.first_name,
			last_name: Faker::Name.last_name,
			email: Faker::Internet.email,
			password: 'password',
			password_confirmation: 'password',
			confirmed_at: Time.now
		)

		user.institutions << institution
		user.institutional_affiliations.find_by(institution: institution).update(is_lecturer: true) if user_indices_to_make_lecturers.include?(i)
	end
end
