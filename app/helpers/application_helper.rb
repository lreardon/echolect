# frozen_string_literal: true

module ApplicationHelper
	def time_ago_abbreviated(time)
		time_ago = time_ago_in_words(time, include_seconds: true)
		t = time_ago.gsub(/minute?/, 'min').gsub(/hour?/, 'hr').gsub(/day?/, 'day').gsub(/second?/, 'sec')
		return 'Yesterday' if  t == '1 day'

		"#{t} ago"
	end
end
