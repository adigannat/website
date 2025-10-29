/**
 * Mobile menu (hamburger) functionality
 * Handles drawer navigation for mobile/tablet screens
 */

export class MobileMenu {
	private menuButton: HTMLButtonElement | null;
	private menuDrawer: HTMLElement | null;
	private menuOverlay: HTMLElement | null;
	private closeButton: HTMLButtonElement | null;
	private isOpen = false;

	constructor() {
		this.menuButton = document.querySelector("[data-mobile-menu-button]");
		this.menuDrawer = document.querySelector("[data-mobile-menu-drawer]");
		this.menuOverlay = document.querySelector("[data-mobile-menu-overlay]");
		this.closeButton = document.querySelector("[data-mobile-menu-close]");

		if (!this.menuButton || !this.menuDrawer || !this.menuOverlay) {
			return;
		}

		this.init();
	}

	private init() {
		// Toggle menu on button click
		this.menuButton?.addEventListener("click", () => {
			this.toggle();
		});

		// Close menu on close button click
		this.closeButton?.addEventListener("click", () => {
			this.close();
		});

		// Close menu on overlay click
		this.menuOverlay?.addEventListener("click", () => {
			this.close();
		});

		// Close menu on Escape key
		document.addEventListener("keydown", (e) => {
			if (e.key === "Escape" && this.isOpen) {
				this.close();
			}
		});

		// Close menu when clicking nav links
		const navLinks = this.menuDrawer?.querySelectorAll("a");
		if (navLinks) {
			for (const link of navLinks) {
				link.addEventListener("click", () => {
					this.close();
				});
			}
		}

		// Handle window resize - close menu if resizing to desktop
		let resizeTimer: number;
		window.addEventListener("resize", () => {
			clearTimeout(resizeTimer);
			resizeTimer = window.setTimeout(() => {
				if (window.innerWidth >= 768 && this.isOpen) {
					this.close();
				}
			}, 250);
		});
	}

	private toggle() {
		if (this.isOpen) {
			this.close();
		} else {
			this.open();
		}
	}

	private open() {
		this.isOpen = true;
		this.menuDrawer?.classList.add("mobile-menu-drawer--open");
		this.menuOverlay?.classList.add("mobile-menu-overlay--visible");
		this.menuButton?.setAttribute("aria-expanded", "true");

		// Prevent body scroll
		document.body.style.overflow = "hidden";

		// Focus first link for accessibility
		const firstLink = this.menuDrawer?.querySelector("a");
		setTimeout(() => {
			firstLink?.focus();
		}, 300);
	}

	private close() {
		this.isOpen = false;
		this.menuDrawer?.classList.remove("mobile-menu-drawer--open");
		this.menuOverlay?.classList.remove("mobile-menu-overlay--visible");
		this.menuButton?.setAttribute("aria-expanded", "false");

		// Restore body scroll
		document.body.style.overflow = "";

		// Return focus to button
		this.menuButton?.focus();
	}

	public isMenuOpen(): boolean {
		return this.isOpen;
	}
}

/**
 * Initialize mobile menu
 */
export function initMobileMenu(): MobileMenu {
	return new MobileMenu();
}
