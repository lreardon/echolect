# frozen_string_literal: true

Course.all.each do |course|
	course_lecturer = course.institution.lecturers.sample
	course.create_offering(course_session: CourseSession.first, user_id: course_lecturer.id)
end
