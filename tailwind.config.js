/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./index.html",
		"./src/**/*.{html,ts,tsx}",
		"./content/**/*.{md,json,yaml,yml}",
	],
	darkMode: "class",
	theme: {
		extend: {
			fontFamily: {
				sans: ['"Inter var"', "system-ui", "sans-serif"],
				mono: ['"JetBrains Mono"', "monospace"],
			},
			colors: {
				primary: {
					DEFAULT: "#1d4ed8",
					foreground: "#ffffff",
				},
				accent: {
					DEFAULT: "#0ea5e9",
					foreground: "#0f172a",
				},
				surface: {
					DEFAULT: "#0f172a",
					light: "#e2e8f0",
				},
			},
			boxShadow: {
				focus: "0 0 0 3px rgba(14, 165, 233, 0.45)",
			},
		},
	},
	plugins: [
		require("@tailwindcss/typography"),
		require("@tailwindcss/forms"),
		require("@tailwindcss/aspect-ratio"),
	],
};
