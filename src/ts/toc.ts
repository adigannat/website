/**
 * Table of Contents with Scroll Spy
 * Automatically generates TOC from headings and highlights active sections
 */

interface TocItem {
	id: string;
	text: string;
	level: number;
	element: HTMLElement;
}

export class TableOfContents {
	private container: HTMLElement | null;
	private content: HTMLElement | null;
	private items: TocItem[] = [];
	private observer: IntersectionObserver | null = null;
	private activeId = "";

	constructor() {
		this.container = document.querySelector("[data-toc]");
		this.content = document.querySelector("[data-toc-content]");

		if (!this.container || !this.content) return;

		this.extractHeadings();
		this.render();
		this.setupScrollSpy();
	}

	private extractHeadings() {
		// Find all h2 and h3 headings in the content
		const headings = this.content?.querySelectorAll("h2, h3");
		if (!headings) return;

		for (const heading of headings) {
			const el = heading as HTMLElement;
			const level = Number.parseInt(el.tagName.substring(1), 10);

			// Generate ID if not present
			let id = el.id;
			if (!id) {
				id = this.generateId(el.textContent || "");
				el.id = id;
			}

			this.items.push({
				id,
				text: el.textContent || "",
				level,
				element: el,
			});
		}
	}

	private generateId(text: string): string {
		return text
			.toLowerCase()
			.replace(/[^\w\s-]/g, "")
			.replace(/\s+/g, "-")
			.replace(/-+/g, "-")
			.trim();
	}

	private render() {
		if (!this.container || this.items.length === 0) {
			this.container?.classList.add("hidden");
			return;
		}

		const html = `
      <div class="toc">
        <h2 class="toc__heading">On this page</h2>
        <nav class="toc__nav" aria-label="Table of contents">
          <ul class="toc__list">
            ${this.items
							.map(
								(item) => `
              <li class="toc__item toc__item--level-${item.level}">
                <a
                  class="toc__link"
                  href="#${item.id}"
                  data-toc-link="${item.id}"
                >
                  ${this.escapeHtml(item.text)}
                </a>
              </li>
            `,
							)
							.join("")}
          </ul>
        </nav>
      </div>
    `;

		this.container.innerHTML = html;

		// Add smooth scroll behavior to links
		const links = this.container.querySelectorAll("[data-toc-link]");
		for (const link of links) {
			link.addEventListener("click", (e) => {
				e.preventDefault();
				const target = (e.currentTarget as HTMLElement).getAttribute(
					"data-toc-link",
				);
				const el = target ? document.getElementById(target) : null;
				if (el) {
					// Smooth scroll to element with offset for fixed header
					const offset = 80;
					const top = el.getBoundingClientRect().top + window.scrollY - offset;
					window.scrollTo({ top, behavior: "smooth" });

					// Update URL without scrolling
					history.pushState(null, "", `#${target}`);
				}
			});
		}
	}

	private setupScrollSpy() {
		// Create intersection observer
		this.observer = new IntersectionObserver(
			(entries) => {
				// Find the first visible heading
				for (const entry of entries) {
					if (entry.isIntersecting) {
						const id = entry.target.id;
						this.setActiveLink(id);
						break;
					}
				}
			},
			{
				rootMargin: "-80px 0px -80% 0px", // Activate when heading is near top
				threshold: 0,
			},
		);

		// Observe all headings
		for (const item of this.items) {
			this.observer.observe(item.element);
		}

		// Set initial active state
		this.updateActiveOnScroll();

		// Update on scroll for manual scroll without intersection
		let scrollTimeout: number;
		window.addEventListener("scroll", () => {
			clearTimeout(scrollTimeout);
			scrollTimeout = window.setTimeout(() => {
				this.updateActiveOnScroll();
			}, 100);
		});
	}

	private updateActiveOnScroll() {
		// Find the first heading that's above the viewport top + offset
		const offset = 100;
		let closestHeading: TocItem | null = null;

		for (const item of this.items) {
			const rect = item.element.getBoundingClientRect();
			if (rect.top <= offset) {
				closestHeading = item;
			} else {
				break; // Headings are in order, so we can stop
			}
		}

		if (closestHeading) {
			this.setActiveLink(closestHeading.id);
		} else if (this.items.length > 0) {
			// If no heading is above, activate the first one
			this.setActiveLink(this.items[0].id);
		}
	}

	private setActiveLink(id: string) {
		if (this.activeId === id) return;

		this.activeId = id;

		// Remove active class from all links
		const links = this.container?.querySelectorAll("[data-toc-link]");
		if (!links) return;

		for (const link of links) {
			if (link.getAttribute("data-toc-link") === id) {
				link.classList.add("toc__link--active");
				link.setAttribute("aria-current", "location");
			} else {
				link.classList.remove("toc__link--active");
				link.removeAttribute("aria-current");
			}
		}
	}

	private escapeHtml(text: string): string {
		const div = document.createElement("div");
		div.textContent = text;
		return div.innerHTML;
	}

	public destroy() {
		this.observer?.disconnect();
	}
}

/**
 * Initialize table of contents
 */
export function initTableOfContents(): TableOfContents | null {
	const tocElement = document.querySelector("[data-toc]");
	if (!tocElement) return null;

	return new TableOfContents();
}

// Auto-initialize on pages with TOC
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", () => {
		initTableOfContents();
	});
} else {
	initTableOfContents();
}
