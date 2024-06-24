# frozen_string_literal: true

module ApplicationHelper
	def time_ago_abbreviated(time)
		time_ago = time_ago_in_words(time, include_seconds: true)
		t = time_ago.gsub(/minute?/, 'min').gsub(/hour?/, 'hr').gsub(/day?/, 'day').gsub(/second?/, 'sec')
		return 'Yesterday' if  t == '1 day'

		"#{t} ago"
	end

	def icon_button(icon_name, options = {}, &block)
		icon_class = options.delete(:icon_class) || 'material-icons'
		button_class = options.delete(:class) || 'icon-button'
		size = options.delete(:size) || 'medium'
		variant = options.delete(:variant) || 'default'

		# Ensure the button is displayed as a flex container and justify and align items are centered
		button_class += " icon-button--#{size} icon-button--#{variant}"

		content_tag(:button, options.merge(type: 'button', class: button_class)) do
			content_tag(:span, icon_name, class: "#{icon_class} flex justify-center items-center") +
				(block_given? ? capture(&block) : '')
		end
	end
end
