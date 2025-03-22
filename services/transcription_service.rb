# frozen_string_literal: true

# app/services/external_api_service.rb
require 'net/http'
require 'uri'
require 'json'

class TranscriptionService
	attr_reader :base_url, :headers

	def initialize
		@base_url = 'http://whisper:5001'
		@headers = {
			'X-API-Key': 'test',
			'Content-Type': 'application/json'
		}
	end

	def ping
		get('/')
	end

	def transcribe(audio_file_url)
		url = URI.join(base_url, '/transcribe')
		body = {
			audioUrl: audio_file_url
		}

		http = Net::HTTP.new(url.host, url.port)

		if url.scheme == 'https'
			http.use_ssl = true
			http.verify_mode = OpenSSL::SSL::VERIFY_PEER
		end

		request = Net::HTTP::Post.new(url.path, default_headers.merge(headers))
		request.body = body.to_json

		puts request
		# puts request.headers
		# puts request.body

		response = http.request(request)

		puts 'DONE'

		{
			code: response.code.to_i,
			body: parse_response(response),
			headers: response.to_hash,
			raw_response: response
		}
	end

	def get(endpoint)
		url = URI.join(base_url, endpoint)
		http = Net::HTTP.new(url.host, url.port)

		# Enable SSL if using https
		if url.scheme == 'https'
			http.use_ssl = true
			http.verify_mode = OpenSSL::SSL::VERIFY_PEER
		end

		# Create the request
		request = Net::HTTP::Get.new(url.path, default_headers.merge(headers))

		# Send the request
		response = http.request(request)

		{
			code: response.code.to_i,
			body: parse_response(response),
			headers: response.to_hash,
			raw_response: response
		}

		# Parse and return the response
	end

	def post(endpoint, payload)
		url = URI.join(base_url, endpoint)
		http = Net::HTTP.new(url.host, url.port)

		# Enable SSL if using https
		if url.scheme == 'https'
			http.use_ssl = true
			http.verify_mode = OpenSSL::SSL::VERIFY_PEER
		end

		# Create the request
		request = Net::HTTP::Post.new(url.path, default_headers.merge(headers))
		request.body = payload.to_json

		# Send the request
		response = http.request(request)

		{
			code: response.code.to_i,
			body: parse_response(response),
			headers: response.to_hash,
			raw_response: response
		}
	end

	private

	def default_headers
		{
			'Content-Type' => 'application/json',
			'Accept' => 'application/json'
		}
	end

	def parse_response(response)
		return nil if response.body.nil? || response.body.empty?

		begin
			JSON.parse(response.body)
		rescue JSON::ParserError
			# Return the raw body if it's not JSON
			response.body
		end
	end
end
