# frozen_string_literal: true

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
class Recording < ApplicationRecord
	belongs_to :lecture
	has_one_attached :audio_file

	def audio_file_url
		audio_file.url.gsub('minio:9000', 'localhost:9000')
	end
end
