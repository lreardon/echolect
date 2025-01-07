# == Schema Information
#
# Table name: courses
#
#  id             :uuid             not null, primary key
#  name           :string
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  institution_id :uuid
#
# Indexes
#
#  index_courses_on_institution_id  (institution_id)
#
# Foreign Keys
#
#  fk_rails_...  (institution_id => institutions.id)
#
require "test_helper"

class CourseTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
