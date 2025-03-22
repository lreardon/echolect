const defaultTheme = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    './public/*.html',
    './app/helpers/**/*.rb',
    './app/javascript/**/*.js',
    './app/views/**/*.{erb,haml,html,slim}'
  ],
  theme: {
		screens: {
      'sm': '420px',
      'md': '640px',
      'lg': '1000px',
			'xl': '1440px'
    },  
    extend: {
      fontFamily: {
//         sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
			colors: {
				'primary': '#61aeb8',
				'surface': '#1e1e1e',
				'secondary': colors.indigo[950],
			},
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/container-queries'),
  ]
}
