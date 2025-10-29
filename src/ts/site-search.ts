/**
 * Site Search
 *
 * Features:
 * - Fuse.js powered fuzzy search
 * - Keyboard shortcuts (Ctrl/Cmd+K, Esc to close)
 * - Modal overlay with results
 * - Arrow key navigation through results
 * - Search across pages, projects, case studies, and blog posts
 * - Type badges for different content types
 */

import Fuse from "fuse.js";

interface SearchItem {
	type: string;
	title: string;
	excerpt: string;
	url: string;
	tags: string[];
}

export class SiteSearch {
	private modal: HTMLElement | null = null;
	private overlay: HTMLElement | null = null;
	private input: HTMLInputElement | null = null;
	private results: HTMLElement | null = null;
	private fuse: Fuse<SearchItem> | null = null;
	private searchIndex: SearchItem[] = [];
	private currentResults: SearchItem[] = [];
	private selectedIndex = 0;
	private isOpen = false;

	constructor() {
		this.createSearchUI();
		this.setupKeyboardShortcuts();
		this.setupTriggerButtons();
		this.loadSearchIndex();
	}

	private setupTriggerButtons(): void {
		// Setup click handlers for search trigger buttons
		const triggers = document.querySelectorAll("[data-search-trigger]");
		for (const trigger of triggers) {
			trigger.addEventListener("click", () => this.open());
		}
	}

	private createSearchUI(): void {
		// Create modal overlay
		this.overlay = document.createElement("div");
		this.overlay.className = "search-overlay";
		this.overlay.setAttribute("data-search-overlay", "");
		this.overlay.setAttribute("aria-hidden", "true");
		this.overlay.addEventListener("click", () => this.close());

		// Create modal
		this.modal = document.createElement("div");
		this.modal.className = "search-modal";
		this.modal.setAttribute("data-search-modal", "");
		this.modal.setAttribute("role", "dialog");
		this.modal.setAttribute("aria-modal", "true");
		this.modal.setAttribute("aria-labelledby", "search-label");

		// Search input container
		const inputContainer = document.createElement("div");
		inputContainer.className = "search-input-container";

		// Search icon
		const searchIcon = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"svg",
		);
		searchIcon.setAttribute("class", "search-icon");
		searchIcon.setAttribute("fill", "none");
		searchIcon.setAttribute("viewBox", "0 0 24 24");
		searchIcon.setAttribute("stroke-width", "2");
		searchIcon.setAttribute("stroke", "currentColor");
		searchIcon.innerHTML =
			'<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />';

		// Input
		this.input = document.createElement("input");
		this.input.type = "text";
		this.input.className = "search-input";
		this.input.placeholder = "Search site...";
		this.input.setAttribute("id", "search-label");
		this.input.setAttribute("aria-label", "Search site");
		this.input.addEventListener("input", () => this.handleSearch());
		this.input.addEventListener("keydown", (e) => this.handleKeyDown(e));

		// Close button
		const closeButton = document.createElement("button");
		closeButton.type = "button";
		closeButton.className = "search-close";
		closeButton.setAttribute("aria-label", "Close search");
		closeButton.innerHTML =
			'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>';
		closeButton.addEventListener("click", () => this.close());

		inputContainer.appendChild(searchIcon);
		inputContainer.appendChild(this.input);
		inputContainer.appendChild(closeButton);

		// Results container
		this.results = document.createElement("div");
		this.results.className = "search-results";
		this.results.setAttribute("role", "listbox");
		this.results.setAttribute("aria-label", "Search results");

		// Help text
		const helpText = document.createElement("div");
		helpText.className = "search-help";
		helpText.innerHTML =
			"<kbd>↑</kbd><kbd>↓</kbd> to navigate, <kbd>Enter</kbd> to select, <kbd>Esc</kbd> to close";

		this.modal.appendChild(inputContainer);
		this.modal.appendChild(this.results);
		this.modal.appendChild(helpText);

		document.body.appendChild(this.overlay);
		document.body.appendChild(this.modal);
	}

	private async loadSearchIndex(): Promise<void> {
		try {
			const response = await fetch("/search-index.json");
			this.searchIndex = await response.json();

			// Initialize Fuse.js
			this.fuse = new Fuse(this.searchIndex, {
				keys: [
					{ name: "title", weight: 0.4 },
					{ name: "excerpt", weight: 0.3 },
					{ name: "tags", weight: 0.3 },
				],
				threshold: 0.4,
				includeScore: true,
				minMatchCharLength: 2,
			});
		} catch (error) {
			console.error("[site-search] Failed to load search index:", error);
		}
	}

	private setupKeyboardShortcuts(): void {
		document.addEventListener("keydown", (e) => {
			// Cmd+K or Ctrl+K to open
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				this.open();
			}

			// Escape to close
			if (e.key === "Escape" && this.isOpen) {
				this.close();
			}
		});
	}

	private handleSearch(): void {
		if (!this.fuse || !this.input || !this.results) return;

		const query = this.input.value.trim();

		if (query.length < 2) {
			this.results.innerHTML =
				'<div class="search-empty">Type at least 2 characters to search</div>';
			this.currentResults = [];
			return;
		}

		const fuseResults = this.fuse.search(query);

		if (fuseResults.length === 0) {
			this.results.innerHTML =
				'<div class="search-empty">No results found</div>';
			this.currentResults = [];
			return;
		}

		this.currentResults = fuseResults.map((result) => result.item);
		this.selectedIndex = 0;
		this.renderResults();
	}

	private renderResults(): void {
		if (!this.results) return;

		this.results.innerHTML = this.currentResults
			.map((item, index) => {
				const typeLabel = this.getTypeLabel(item.type);
				const typeBadge = `<span class="search-result-type search-result-type--${item.type}">${typeLabel}</span>`;

				return `<a
          href="${item.url}"
          class="search-result ${index === this.selectedIndex ? "search-result--selected" : ""}"
          role="option"
          aria-selected="${index === this.selectedIndex}"
          data-search-result-index="${index}"
        >
          <div class="search-result-header">
            <span class="search-result-title">${this.escapeHtml(item.title)}</span>
            ${typeBadge}
          </div>
          <p class="search-result-excerpt">${this.escapeHtml(item.excerpt)}</p>
          ${item.tags.length > 0 ? `<div class="search-result-tags">${item.tags.map((tag) => `<span class="search-result-tag">${this.escapeHtml(tag)}</span>`).join("")}</div>` : ""}
        </a>`;
			})
			.join("");

		// Add click handlers
		const resultElements = this.results.querySelectorAll(
			"[data-search-result-index]",
		);
		for (const element of resultElements) {
			element.addEventListener("click", (e) => {
				e.preventDefault();
				const href = (element as HTMLAnchorElement).href;
				this.close();
				window.location.href = href;
			});
		}
	}

	private handleKeyDown(e: KeyboardEvent): void {
		if (this.currentResults.length === 0) return;

		if (e.key === "ArrowDown") {
			e.preventDefault();
			this.selectedIndex = Math.min(
				this.selectedIndex + 1,
				this.currentResults.length - 1,
			);
			this.renderResults();
			this.scrollToSelected();
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
			this.renderResults();
			this.scrollToSelected();
		} else if (e.key === "Enter") {
			e.preventDefault();
			const selectedResult = this.currentResults[this.selectedIndex];
			if (selectedResult) {
				this.close();
				window.location.href = selectedResult.url;
			}
		}
	}

	private scrollToSelected(): void {
		if (!this.results) return;

		const selected = this.results.querySelector(".search-result--selected");
		if (selected) {
			selected.scrollIntoView({ block: "nearest", behavior: "smooth" });
		}
	}

	private getTypeLabel(type: string): string {
		const labels: Record<string, string> = {
			page: "Page",
			project: "Project",
			"case-study": "Case Study",
			blog: "Blog Post",
		};
		return labels[type] || type;
	}

	private escapeHtml(text: string): string {
		const div = document.createElement("div");
		div.textContent = text;
		return div.innerHTML;
	}

	public open(): void {
		if (this.isOpen) return;

		this.isOpen = true;

		if (this.overlay) {
			this.overlay.classList.add("search-overlay--active");
			this.overlay.setAttribute("aria-hidden", "false");
		}

		if (this.modal) {
			this.modal.classList.add("search-modal--active");
		}

		if (this.input) {
			this.input.value = "";
			this.input.focus();
		}

		if (this.results) {
			this.results.innerHTML =
				'<div class="search-empty">Type at least 2 characters to search</div>';
		}

		// Prevent body scroll
		document.body.style.overflow = "hidden";
	}

	public close(): void {
		if (!this.isOpen) return;

		this.isOpen = false;

		if (this.overlay) {
			this.overlay.classList.remove("search-overlay--active");
			this.overlay.setAttribute("aria-hidden", "true");
		}

		if (this.modal) {
			this.modal.classList.remove("search-modal--active");
		}

		// Restore body scroll
		document.body.style.overflow = "";

		// Clear results
		this.currentResults = [];
		this.selectedIndex = 0;
	}
}

/**
 * Initialize site search
 */
export function initSiteSearch(): SiteSearch {
	return new SiteSearch();
}

// Auto-initialize on page load
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", () => {
		initSiteSearch();
	});
} else {
	initSiteSearch();
}
