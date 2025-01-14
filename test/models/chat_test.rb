# == Schema Information
#
# Table name: chats
#
#  id         :uuid             not null, primary key
#  code       :string           not null
#  name       :string
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  lecture_id :uuid
#  user_id    :uuid             not null
#
# Indexes
#
#  index_chats_on_code     (code) UNIQUE
#  index_chats_on_user_id  (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
require "test_helper"

class ChatTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
