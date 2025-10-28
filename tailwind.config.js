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
				display: ['"Inter var"', "system-ui", "sans-serif"],
			},
			fontSize: {
				"2xs": ["0.625rem", { lineHeight: "0.875rem" }],
				"display-sm": [
					"2.5rem",
					{ lineHeight: "3rem", letterSpacing: "-0.02em" },
				],
				"display-md": [
					"3rem",
					{ lineHeight: "3.5rem", letterSpacing: "-0.02em" },
				],
				"display-lg": [
					"4rem",
					{ lineHeight: "4.5rem", letterSpacing: "-0.02em" },
				],
				"display-xl": [
					"5rem",
					{ lineHeight: "5.5rem", letterSpacing: "-0.02em" },
				],
			},
			colors: {
				primary: {
					50: "#eff6ff",
					100: "#dbeafe",
					200: "#bfdbfe",
					300: "#93c5fd",
					400: "#60a5fa",
					500: "#3b82f6",
					600: "#2563eb",
					700: "#1d4ed8",
					800: "#1e40af",
					900: "#1e3a8a",
					950: "#172554",
					DEFAULT: "#1d4ed8",
					foreground: "#ffffff",
				},
				accent: {
					50: "#f0f9ff",
					100: "#e0f2fe",
					200: "#bae6fd",
					300: "#7dd3fc",
					400: "#38bdf8",
					500: "#0ea5e9",
					600: "#0284c7",
					700: "#0369a1",
					800: "#075985",
					900: "#0c4a6e",
					DEFAULT: "#0ea5e9",
					foreground: "#0f172a",
				},
				// Category colors for tech stacks
				fastapi: {
					DEFAULT: "#009688",
					light: "#4db6ac",
					dark: "#00796b",
					glow: "rgba(0, 150, 136, 0.4)",
				},
				iceberg: {
					DEFAULT: "#00bcd4",
					light: "#4dd0e1",
					dark: "#0097a7",
					glow: "rgba(0, 188, 212, 0.4)",
				},
				automation: {
					DEFAULT: "#9c27b0",
					light: "#ba68c8",
					dark: "#7b1fa2",
					glow: "rgba(156, 39, 176, 0.4)",
				},
				analytics: {
					DEFAULT: "#ff9800",
					light: "#ffb74d",
					dark: "#f57c00",
					glow: "rgba(255, 152, 0, 0.4)",
				},
				// Semantic colors
				success: {
					DEFAULT: "#10b981",
					light: "#34d399",
					dark: "#059669",
					glow: "rgba(16, 185, 129, 0.4)",
				},
				warning: {
					DEFAULT: "#f59e0b",
					light: "#fbbf24",
					dark: "#d97706",
				},
				error: {
					DEFAULT: "#ef4444",
					light: "#f87171",
					dark: "#dc2626",
				},
				surface: {
					DEFAULT: "#0f172a",
					light: "#e2e8f0",
					elevated: "#1e293b",
					overlay: "rgba(15, 23, 42, 0.95)",
				},
			},
			backgroundImage: {
				"gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
				"gradient-conic":
					"conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
				"gradient-mesh":
					"radial-gradient(at 0% 0%, rgba(29, 78, 216, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(14, 165, 233, 0.15) 0px, transparent 50%)",
				"gradient-hero":
					"linear-gradient(135deg, rgba(29, 78, 216, 0.1) 0%, rgba(14, 165, 233, 0.1) 100%)",
				"gradient-card":
					"linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)",
			},
			boxShadow: {
				// Elevation system
				xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
				sm: "0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06)",
				md: "0 4px 6px -1px rgba(0, 0, 0, 0.15), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
				lg: "0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
				xl: "0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
				"2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.35)",

				// Colored shadows
				primary:
					"0 10px 25px -5px rgba(29, 78, 216, 0.3), 0 5px 10px -5px rgba(29, 78, 216, 0.2)",
				"primary-lg":
					"0 20px 40px -10px rgba(29, 78, 216, 0.4), 0 10px 20px -5px rgba(29, 78, 216, 0.2)",
				accent:
					"0 10px 25px -5px rgba(14, 165, 233, 0.3), 0 5px 10px -5px rgba(14, 165, 233, 0.2)",
				"accent-lg":
					"0 20px 40px -10px rgba(14, 165, 233, 0.4), 0 10px 20px -5px rgba(14, 165, 233, 0.2)",

				// Glow effects
				glow: "0 0 20px rgba(29, 78, 216, 0.5), 0 0 40px rgba(29, 78, 216, 0.3)",
				"glow-accent":
					"0 0 20px rgba(14, 165, 233, 0.5), 0 0 40px rgba(14, 165, 233, 0.3)",
				"glow-sm": "0 0 10px rgba(29, 78, 216, 0.4)",

				// Inner shadows for depth
				"inner-lg": "inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)",
				"inner-xl": "inset 0 4px 8px 0 rgba(0, 0, 0, 0.4)",

				// Focus state
				focus: "0 0 0 3px rgba(14, 165, 233, 0.45)",
			},
			animation: {
				"fade-in": "fadeIn 0.6s ease-out",
				"fade-in-up": "fadeInUp 0.8s ease-out",
				"fade-in-down": "fadeInDown 0.8s ease-out",
				"slide-in-left": "slideInLeft 0.6s ease-out",
				"slide-in-right": "slideInRight 0.6s ease-out",
				"scale-in": "scaleIn 0.5s ease-out",
				float: "float 3s ease-in-out infinite",
				"pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
				shimmer: "shimmer 2s linear infinite",
				glow: "glow 2s ease-in-out infinite",
				gradient: "gradient 8s linear infinite",
				"bounce-subtle": "bounceSubtle 2s ease-in-out infinite",
			},
			keyframes: {
				fadeIn: {
					"0%": { opacity: "0" },
					"100%": { opacity: "1" },
				},
				fadeInUp: {
					"0%": { opacity: "0", transform: "translateY(20px)" },
					"100%": { opacity: "1", transform: "translateY(0)" },
				},
				fadeInDown: {
					"0%": { opacity: "0", transform: "translateY(-20px)" },
					"100%": { opacity: "1", transform: "translateY(0)" },
				},
				slideInLeft: {
					"0%": { opacity: "0", transform: "translateX(-30px)" },
					"100%": { opacity: "1", transform: "translateX(0)" },
				},
				slideInRight: {
					"0%": { opacity: "0", transform: "translateX(30px)" },
					"100%": { opacity: "1", transform: "translateX(0)" },
				},
				scaleIn: {
					"0%": { opacity: "0", transform: "scale(0.9)" },
					"100%": { opacity: "1", transform: "scale(1)" },
				},
				float: {
					"0%, 100%": { transform: "translateY(0px)" },
					"50%": { transform: "translateY(-10px)" },
				},
				shimmer: {
					"0%": { backgroundPosition: "-1000px 0" },
					"100%": { backgroundPosition: "1000px 0" },
				},
				glow: {
					"0%, 100%": { boxShadow: "0 0 20px rgba(29, 78, 216, 0.5)" },
					"50%": { boxShadow: "0 0 40px rgba(29, 78, 216, 0.8)" },
				},
				gradient: {
					"0%, 100%": { backgroundPosition: "0% 50%" },
					"50%": { backgroundPosition: "100% 50%" },
				},
				bounceSubtle: {
					"0%, 100%": { transform: "translateY(0)" },
					"50%": { transform: "translateY(-5px)" },
				},
			},
			backdropBlur: {
				xs: "2px",
			},
			borderRadius: {
				"4xl": "2rem",
			},
			scale: {
				102: "1.02",
				103: "1.03",
			},
			spacing: {
				18: "4.5rem",
				88: "22rem",
				112: "28rem",
				128: "32rem",
			},
		},
	},
	plugins: [
		require("@tailwindcss/typography"),
		require("@tailwindcss/forms"),
		require("@tailwindcss/aspect-ratio"),
	],
};
