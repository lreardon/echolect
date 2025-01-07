# frozen_string_literal: true

class TimeChannel < ApplicationCable::Channel
	# periodically :ping, every: 1.seconds

	# def ping
	# 	# broadcast_to 'TimeChannel', time: Time.now.strftime('%H:%M:%S')
	# 	ActionCable.server.broadcast('TimeChannel', { message: 'HEY' })
	# end

	def subscribed
		# stream_from "some_channel"
		stream_from 'TimeChannel'
	end

	def unsubscribed
		# Any cleanup needed when channel is unsubscribed
	end
end
