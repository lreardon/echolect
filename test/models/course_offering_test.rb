# == Schema Information
#
# Table name: course_offerings
#
#  id                :uuid             not null, primary key
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  course_id         :uuid
#  course_session_id :uuid
#  user_id           :uuid
#
# Indexes
#
#  index_course_offerings_on_course_id          (course_id)
#  index_course_offerings_on_course_session_id  (course_session_id)
#  index_course_offerings_on_user_id            (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (course_id => courses.id)
#  fk_rails_...  (course_session_id => course_sessions.id)
#  fk_rails_...  (user_id => users.id)
#
require "test_helper"

class CourseOfferingTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
