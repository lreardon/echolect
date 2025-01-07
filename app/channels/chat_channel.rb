# frozen_string_literal: true

class ChatChannel < ApplicationCable::Channel
	def subscribed
		# stream_from "some_channel"
	end

	def receive(data)
		ActionCable.server.broadcast('test', 'ActionCable is connected')
	end

	def unsubscribed
		# Any cleanup needed when channel is unsubscribed
	end
end
