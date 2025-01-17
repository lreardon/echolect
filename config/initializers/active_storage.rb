# frozen_string_literal: true

# config/initializers/active_storage.rb
Rails.application.config.after_initialize do
	ActiveStorage::Blob.class_eval do
		def public_url(**options)
			original_url = service.url(**options)
			original_url.gsub('minio:9000', 'localhost:9000')
		end
	end
end
