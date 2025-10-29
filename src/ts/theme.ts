/**
 * Theme management system
 * Handles dark/light mode toggle with localStorage persistence
 */

type Theme = "light" | "dark";

const STORAGE_KEY = "theme-preference";
const MEDIA_QUERY = "(prefers-color-scheme: dark)";

export class ThemeManager {
	private currentTheme: Theme;

	constructor() {
		// Initialize theme from storage or system preference
		this.currentTheme = this.getInitialTheme();
		this.applyTheme(this.currentTheme, false);
	}

	/**
	 * Get initial theme from localStorage or system preference
	 */
	private getInitialTheme(): Theme {
		const html = document.documentElement;
		const preset = html.dataset.theme as Theme | undefined;
		if (preset === "light" || preset === "dark") {
			return preset;
		}

		// Check localStorage first
		try {
			const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
			if (stored === "light" || stored === "dark") {
				return stored;
			}
		} catch (error) {
			// Ignore storage access issues and fallback to system preference
		}

		// Fall back to system preference
		return window.matchMedia(MEDIA_QUERY).matches ? "dark" : "light";
	}

	/**
	 * Apply theme to DOM
	 */
	private applyTheme(theme: Theme, animate = true) {
		const html = document.documentElement;

		// Add transition class if animating
		if (animate) {
			html.classList.add("theme-transitioning");
		}

		if (theme === "dark") {
			html.classList.add("dark");
		} else {
			html.classList.remove("dark");
		}
		html.dataset.theme = theme;
		html.style.colorScheme = theme === "dark" ? "dark light" : "light dark";

		// Update meta theme-color for mobile browsers
		this.updateMetaThemeColor(theme);

		// Remove transition class after animation
		if (animate) {
			setTimeout(() => {
				html.classList.remove("theme-transitioning");
			}, 300);
		}

		this.currentTheme = theme;
	}

	/**
	 * Update meta theme-color tag
	 */
	private updateMetaThemeColor(theme: Theme) {
		let metaTag = document.querySelector('meta[name="theme-color"]');
		if (!metaTag) {
			metaTag = document.createElement("meta");
			metaTag.setAttribute("name", "theme-color");
			document.head.appendChild(metaTag);
		}
		// Dark: slate-950 (#020617), Light: white (#ffffff)
		metaTag.setAttribute("content", theme === "dark" ? "#020617" : "#ffffff");
	}

	/**
	 * Toggle between light and dark theme
	 */
	public toggle(): Theme {
		const newTheme: Theme = this.currentTheme === "dark" ? "light" : "dark";
		this.setTheme(newTheme);
		return newTheme;
	}

	/**
	 * Set specific theme
	 */
	public setTheme(theme: Theme): void {
		if (this.currentTheme === theme) {
			return;
		}

		this.applyTheme(theme);
		try {
			localStorage.setItem(STORAGE_KEY, theme);
		} catch (error) {
			// Ignore storage write failures (e.g., privacy mode)
		}

		// Dispatch custom event for other components
		window.dispatchEvent(
			new CustomEvent("theme-change", {
				detail: { theme },
			}),
		);
	}

	/**
	 * Get current theme
	 */
	public getTheme(): Theme {
		return this.currentTheme;
	}

	/**
	 * Listen for system theme changes
	 */
	public watchSystemPreference(): void {
		const mediaQuery = window.matchMedia(MEDIA_QUERY);

		// Modern browsers
		if (mediaQuery.addEventListener) {
			mediaQuery.addEventListener("change", (e) => {
				// Only auto-switch if user hasn't manually set a preference
				let hasManualPreference = false;
				try {
					hasManualPreference = Boolean(localStorage.getItem(STORAGE_KEY));
				} catch (error) {
					hasManualPreference = false;
				}
				if (!hasManualPreference) {
					this.setTheme(e.matches ? "dark" : "light");
				}
			});
		}
	}
}

/**
 * Initialize theme toggle button
 */
export function initThemeToggle(manager: ThemeManager): void {
	const toggleButton = document.querySelector(
		"[data-theme-toggle]",
	) as HTMLButtonElement;
	if (!toggleButton) return;

	// Update button aria-label and icons
	const updateButton = (theme: Theme) => {
		const sunIcon = toggleButton.querySelector("[data-theme-icon-sun]");
		const moonIcon = toggleButton.querySelector("[data-theme-icon-moon]");

		if (sunIcon && moonIcon) {
			if (theme === "dark") {
				sunIcon.classList.remove("hidden");
				moonIcon.classList.add("hidden");
			} else {
				sunIcon.classList.add("hidden");
				moonIcon.classList.remove("hidden");
			}
		}

		toggleButton.setAttribute(
			"aria-label",
			theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
		);
		toggleButton.setAttribute("aria-pressed", String(theme === "dark"));
	};

	// Initial state
	updateButton(manager.getTheme());

	// Handle click
	toggleButton.addEventListener("click", () => {
		const newTheme = manager.toggle();
		updateButton(newTheme);
	});

	// Listen for theme changes from other sources
	window.addEventListener("theme-change", ((e: CustomEvent) => {
		updateButton(e.detail.theme);
	}) as EventListener);
}
