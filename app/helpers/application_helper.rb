# frozen_string_literal: true

module ApplicationHelper
	def time_ago_abbreviated(time)
		time_ago = time_ago_in_words(time)
		time_ago.gsub(/minutes?/, 'mins').gsub(/hours?/, 'hrs').gsub(/days?/, 'days').gsub(/seconds?/, 'secs')
	end
end
