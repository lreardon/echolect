# == Schema Information
#
# Table name: recordings
#
#  id         :uuid             not null, primary key
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  lecture_id :uuid
#
# Indexes
#
#  index_recordings_on_lecture_id  (lecture_id)
#
# Foreign Keys
#
#  fk_rails_...  (lecture_id => lectures.id)
#
require "test_helper"

class RecordingTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
