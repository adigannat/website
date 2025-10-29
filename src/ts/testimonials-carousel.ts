/**
 * Testimonials Carousel
 *
 * Features:
 * - Auto-rotation with configurable interval
 * - Manual navigation (prev/next buttons)
 * - Keyboard support (arrow keys, Enter/Space)
 * - Touch/swipe support for mobile
 * - Pause on hover/focus
 * - ARIA live region for screen readers
 * - Smooth fade transitions
 */

export class TestimonialsCarousel {
	private container: HTMLElement | null = null;
	private track: HTMLElement | null = null;
	private slides: HTMLElement[] = [];
	private prevButton: HTMLButtonElement | null = null;
	private nextButton: HTMLButtonElement | null = null;
	private indicators: HTMLElement[] = [];
	private currentIndex = 0;
	private autoRotateTimer: ReturnType<typeof setTimeout> | null = null;
	private readonly autoRotateInterval = 7000; // 7 seconds
	private isPaused = false;
	private touchStartX = 0;
	private touchEndX = 0;

	constructor() {
		this.container = document.querySelector("[data-testimonials-carousel]");
		if (!this.container) return;

		this.track = this.container.querySelector(
			"[data-testimonials-track]",
		) as HTMLElement;
		this.prevButton = this.container.querySelector(
			"[data-testimonials-prev]",
		) as HTMLButtonElement;
		this.nextButton = this.container.querySelector(
			"[data-testimonials-next]",
		) as HTMLButtonElement;

		if (!this.track) return;

		this.slides = Array.from(
			this.track.querySelectorAll("[data-testimonial-slide]"),
		);
		this.indicators = Array.from(
			this.container.querySelectorAll("[data-testimonial-indicator]"),
		);

		if (this.slides.length === 0) return;

		this.init();
	}

	private init(): void {
		// Set initial state
		this.goToSlide(0, false);

		// Navigation buttons
		if (this.prevButton) {
			this.prevButton.addEventListener("click", () => this.prev());
		}

		if (this.nextButton) {
			this.nextButton.addEventListener("click", () => this.next());
		}

		// Indicators
		for (const [index, indicator] of this.indicators.entries()) {
			indicator.addEventListener("click", () => this.goToSlide(index));
			indicator.addEventListener("keydown", (e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					this.goToSlide(index);
				}
			});
		}

		// Keyboard navigation
		if (this.container) {
			this.container.addEventListener("keydown", (e) => {
				if (e.key === "ArrowLeft") {
					e.preventDefault();
					this.prev();
				} else if (e.key === "ArrowRight") {
					e.preventDefault();
					this.next();
				}
			});
		}

		// Touch/swipe support
		if (this.track) {
			this.track.addEventListener("touchstart", (e) => {
				this.touchStartX = e.changedTouches[0].screenX;
			});

			this.track.addEventListener("touchend", (e) => {
				this.touchEndX = e.changedTouches[0].screenX;
				this.handleSwipe();
			});
		}

		// Pause on hover
		if (this.container) {
			this.container.addEventListener("mouseenter", () => this.pause());
			this.container.addEventListener("mouseleave", () => this.resume());
			this.container.addEventListener("focusin", () => this.pause());
			this.container.addEventListener("focusout", () => this.resume());
		}

		// Start auto-rotation
		this.startAutoRotate();
	}

	private handleSwipe(): void {
		const swipeThreshold = 50;
		const diff = this.touchStartX - this.touchEndX;

		if (Math.abs(diff) > swipeThreshold) {
			if (diff > 0) {
				// Swipe left - go to next
				this.next();
			} else {
				// Swipe right - go to previous
				this.prev();
			}
		}
	}

	private goToSlide(index: number, animate = true): void {
		if (index < 0 || index >= this.slides.length) return;

		this.currentIndex = index;

		// Update slides visibility
		for (const [i, slide] of this.slides.entries()) {
			if (i === index) {
				slide.classList.remove("hidden");
				slide.classList.add("testimonial-slide--active");
				slide.setAttribute("aria-hidden", "false");

				if (animate) {
					// Trigger fade-in animation
					slide.style.animation = "none";
					void slide.offsetHeight; // Force reflow
					slide.style.animation = "";
				}
			} else {
				slide.classList.add("hidden");
				slide.classList.remove("testimonial-slide--active");
				slide.setAttribute("aria-hidden", "true");
			}
		}

		// Update indicators
		for (const [i, indicator] of this.indicators.entries()) {
			if (i === index) {
				indicator.classList.add("testimonial-indicator--active");
				indicator.setAttribute("aria-current", "true");
			} else {
				indicator.classList.remove("testimonial-indicator--active");
				indicator.setAttribute("aria-current", "false");
			}
		}

		// Update button states
		if (this.prevButton) {
			this.prevButton.disabled = index === 0;
			this.prevButton.setAttribute(
				"aria-disabled",
				index === 0 ? "true" : "false",
			);
		}

		if (this.nextButton) {
			this.nextButton.disabled = index === this.slides.length - 1;
			this.nextButton.setAttribute(
				"aria-disabled",
				index === this.slides.length - 1 ? "true" : "false",
			);
		}

		// Announce to screen readers
		this.announceSlideChange(index);
	}

	private announceSlideChange(newIndex: number): void {
		const liveRegion = this.container?.querySelector(
			"[data-testimonials-live]",
		);
		if (liveRegion) {
			liveRegion.textContent = `Testimonial ${newIndex + 1} of ${this.slides.length}`;
		}
	}

	public next(): void {
		const nextIndex =
			this.currentIndex === this.slides.length - 1 ? 0 : this.currentIndex + 1;
		this.goToSlide(nextIndex);
		this.resetAutoRotate();
	}

	public prev(): void {
		const prevIndex =
			this.currentIndex === 0 ? this.slides.length - 1 : this.currentIndex - 1;
		this.goToSlide(prevIndex);
		this.resetAutoRotate();
	}

	private startAutoRotate(): void {
		if (this.slides.length <= 1) return;

		this.autoRotateTimer = setTimeout(() => {
			if (!this.isPaused) {
				this.next();
			}
			this.startAutoRotate();
		}, this.autoRotateInterval);
	}

	private stopAutoRotate(): void {
		if (this.autoRotateTimer) {
			clearTimeout(this.autoRotateTimer);
			this.autoRotateTimer = null;
		}
	}

	private resetAutoRotate(): void {
		this.stopAutoRotate();
		this.startAutoRotate();
	}

	public pause(): void {
		this.isPaused = true;
	}

	public resume(): void {
		this.isPaused = false;
	}

	public destroy(): void {
		this.stopAutoRotate();
	}
}

// Initialize carousel
export function initTestimonialsCarousel(): TestimonialsCarousel | null {
	const carouselElement = document.querySelector(
		"[data-testimonials-carousel]",
	);
	if (!carouselElement) return null;

	return new TestimonialsCarousel();
}

// Auto-initialize on page load
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", () => {
		initTestimonialsCarousel();
	});
} else {
	initTestimonialsCarousel();
}
