# frozen_string_literal: true

# config/initializers/active_storage.rb
require 'active_storage/service/s3_service'

module BlobUrlOverride
	def url(**)
		original_url = super
		original_url.gsub('minio:9000', 'localhost:9000')
		# original_url.gsub(ENV.fetch('MINIO_HOST', 'minio:9000'),
		# 	ENV.fetch('PUBLIC_MINIO_HOST', 'localhost:9000'))
	end
end

module DirectUploadUrlOverride
	def url_for_direct_upload(key, **)
		original_url = super
		original_url.gsub('minio:9000', 'localhost:9000')
		# original_url.gsub(ENV.fetch('MINIO_HOST', 'minio:9000'),
		# 	ENV.fetch('PUBLIC_MINIO_HOST', 'localhost:9000'))
		#
	end
end

Rails.application.config.after_initialize do
	ActiveStorage::Attached::One.prepend(BlobUrlOverride)
	ActiveStorage::Service::S3Service.prepend(DirectUploadUrlOverride)
end
