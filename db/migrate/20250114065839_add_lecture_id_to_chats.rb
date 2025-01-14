# frozen_string_literal: true

class AddLectureIdToChats < ActiveRecord::Migration[7.1]
	def change
		add_column :chats, :lecture_id, :uuid
	end
end
