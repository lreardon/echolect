# frozen_string_literal: true

class ChatChannel < ApplicationCable::Channel
	def subscribed
		stream_from "chat:#{params[:chat_id]}"
		puts "STREAMING FROM chat:#{params[:chat_id]}"
	end

	# def receive(data)
	# 	ActionCable.server.broadcast('test', 'ActionCable is connected')
	# end

	def unsubscribed
		# Any cleanup needed when channel is unsubscribed
	end
end
