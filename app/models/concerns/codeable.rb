# frozen_string_literal: true

module Codeable
	extend ActiveSupport::Concern

	included do
		class_attribute :codes
		self.codes = Set.new

		def ensure_codes
			self.class.codes.each do |code_name|
				send("ensure_#{code_name}")
			end
		end

		before_validation :ensure_codes
	end

	class_methods do
		def has_code(column_name = :code, as: nil, length: 8) # rubocop:disable Naming/PredicateName
			raise ArgumentError, "Code definition for '#{column_name}' already exists." if column_name.in?(codes)

			codes << column_name

			code_accessor = as || column_name

			validates column_name, presence: true, uniqueness: true

			define_method(code_accessor) do
				read_attribute(column_name)
			end

			define_method("#{code_accessor}=") do |value|
				raise 'Code is immutable and cannot be changed once set.' if read_attribute(column_name).present?

				write_attribute(column_name, value)
			end

			define_method("ensure_#{column_name}") do
				return if read_attribute(column_name).present?

				code = loop do
					c = SecureRandom.alphanumeric(length)
					break c unless self.class.exists?(column_name => c)
				end

				# puts 'CODE GENERATED'
				# puts code

				send("#{code_accessor}=", code)
			end
		end
	end
end
