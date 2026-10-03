import type { Config } from 'tailwindcss';
import {
	borderRadius,
	borderWidth,
	boxShadow,
	categoricalColors,
	colors,
	fontFamily,
	fontSize,
	ink,
	spacing,
	statusColors,
	typography
} from './theme';

export default {
	content: [
		'./app/**/*.{js,jsx,ts,tsx}',
		'!./app/**/*.test.{ts,tsx}',
		'./node_modules/react-tailwindcss-datepicker/dist/index.esm.js'
	],
	darkMode: '',
	future: {
		hoverOnlyWhenSupported: true
	},
	theme: {
		extend: {
			borderRadius: borderRadius,
			borderWidth: borderWidth,
			boxShadow: boxShadow,
			colors: { ...colors, ...statusColors, ...ink, ...categoricalColors },
			fontFamily: fontFamily,
			fontSize: fontSize,
			spacing: spacing,
			typography: typography,
			listStyleType: {
				circle: 'circle'
			},
			keyframes: {
				'status-pulse': {
					'0%': { transform: 'scale(1)', opacity: '0.32' },
					'100%': { transform: 'scale(2.1)', opacity: '0' }
				}
			},
			animation: {
				'status-pulse': 'status-pulse 2.4s ease-out infinite'
			}
		}
	},
	plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')]
} satisfies Config;
