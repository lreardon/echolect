# frozen_string_literal: true

require 'faker'

3.times do
	Institution.create(name: Faker::Educator.university)
end
