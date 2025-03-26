# frozen_string_literal: true

Rails.application.configure do
	# config.lograge.keep_original_rails_log = true
	# config.lograge.logger = ActiveSupport::Logger.new "#{Rails.root}/log/lograge_#{Rails.env}.log"

	config.lograge.enabled = true
end
