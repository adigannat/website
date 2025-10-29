(() => {
	const STORAGE_KEY = "theme-preference";
	const MEDIA_QUERY = "(prefers-color-scheme: dark)";
	const doc = document.documentElement;

	function resolveTheme() {
		try {
			const stored = window.localStorage.getItem(STORAGE_KEY);
			if (stored === "light" || stored === "dark") {
				return stored;
			}
		} catch (error) {
			// Access to localStorage can fail (e.g., privacy mode); ignore and fallback
		}

		return window.matchMedia?.(MEDIA_QUERY)?.matches ? "dark" : "light";
	}

	function applyTheme(theme) {
		if (theme === "dark") {
			doc.classList.add("dark");
		} else {
			doc.classList.remove("dark");
		}
		doc.dataset.theme = theme;
		doc.style.colorScheme = theme === "dark" ? "dark light" : "light dark";
	}

	try {
		applyTheme(resolveTheme());
	} catch (error) {
		// As a last resort, respect the current class state or system preference
		if (!doc.classList.contains("dark")) {
			const prefersDark = window.matchMedia?.(MEDIA_QUERY)?.matches;
			if (prefersDark) {
				doc.classList.add("dark");
				doc.dataset.theme = "dark";
				doc.style.colorScheme = "dark light";
			}
		}
	}
})();
