import { join } from 'path'
import forms from '@tailwindcss/forms'
import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
module.exports = {
	important: true,
	darkMode: 'class',
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {},
	},
	plugins: [typography,require("daisyui")],
	daisyui: {
		themes: ["lemonade"],
	  },	
}
