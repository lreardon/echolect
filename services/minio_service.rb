# frozen_string_literal: true

require 'active_storage/service/s3_service'

class MinioService < ActiveStorage::Service::S3Service
	def url(key, expires_in:, filename:, **options)
		generated_url = super
		generated_url.gsub('minio:9000', 'localhost:9000')
	end
end
