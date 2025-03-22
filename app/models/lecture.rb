# frozen_string_literal: true

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
class Lecture < ApplicationRecord
	belongs_to :course_offering
	has_one :user, through: :course_offering
	has_one :chat
	has_one :recording

	after_create :associate_chat

	def start_time_display
		start_time.strftime('%B %d, %Y %I:%M %p')
	end

	def recording?
		!recording.nil?
	end

	private

	def associate_chat
		chat = Chat.new(lecture: self, user_id: user.id, name: "#{course_offering.name}- #{start_time_display}- Chat")

		raise ActiveRecord::Rollback unless chat.save

		update(chat_id: chat.id)
	end
end
