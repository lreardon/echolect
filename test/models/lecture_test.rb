# == Schema Information
#
# Table name: lectures
#
#  id                 :uuid             not null, primary key
#  start_time         :datetime
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  chat_id            :uuid
#  course_offering_id :uuid
#
require "test_helper"

class LectureTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
