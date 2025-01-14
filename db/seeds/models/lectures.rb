# frozen_string_literal: true

CourseOffering.all.each do |course_offering|
	first_day = rand(1..7).days.from_now.beginning_of_day
	start_hour = rand(8..18)
	start_minute = [0, 30].sample
	first_start_time = first_day + start_hour.hours + start_minute.minutes

	15.times do |n|
		course_offering.create_lecture(
							start_time: first_start_time + n.weeks
						)
	end
end
