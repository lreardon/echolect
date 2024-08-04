# frozen_string_literal: true

# app/channels/audio_channel.rb
class AudioChannel < ApplicationCable::Channel
	def subscribed
		stream_from 'audio_channel'
	end

	def receive(data)
		# Handle the received audio data
		# For example, you can save it to a file or process it further
		File.open('tmp/test_audio.ogg', 'ab') do |file|
			file.write(Base64.decode64(data['audio_data']))
		end
	end

	def unsubscribed
		# Any cleanup needed when channel is unsubscribed
	end
end
