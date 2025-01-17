# frozen_string_literal: true

require_relative 'boot'

require 'rails/all'
require 'unicode/emoji'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Echolect
	class Application < Rails::Application
		# Initialize configuration defaults for originally generated Rails version.
		config.load_defaults 7.0

		# Configuration for the application, engines, and railties goes here.
		#
		# These settings can be overridden in specific environments using the files
		# in config/environments, which are processed later.
		#
		# config.time_zone = "Central Time (US & Canada)"
		# config.eager_load_paths << Rails.root.join("extras")

		config.action_mailer.perform_deliveries = true
		config.action_mailer.perform_caching = false
		config.action_mailer.raise_delivery_errors = true
		config.action_mailer.default_url_options = { host: 'www.echolect.co', protocol: 'https' }
		config.action_mailer.delivery_method = :smtp
		config.action_mailer.asset_host = 'https://echolect.co'

		config.generators do |g|
			g.orm :active_record, primary_key_type: :uuid
		end

		config.active_storage.service = :minio
	end
end
