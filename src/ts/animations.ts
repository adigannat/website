/**
 * Enhanced animations and interactions for professional portfolio
 * Creates visual interest while maintaining performance and accessibility
 */

// Varied entrance animations with stagger effect
function initScrollAnimations(): void {
	const observerOptions = {
		threshold: 0.1,
		rootMargin: "0px 0px -80px 0px",
	};

	const observer = new IntersectionObserver((entries) => {
		for (const entry of entries) {
			if (entry.isIntersecting) {
				const element = entry.target as HTMLElement;
				const animationType = element.dataset.animation || "fade-in-up";
				const delay = Number.parseInt(element.dataset.delay || "0", 10);

				setTimeout(() => {
					element.classList.add(`animate-${animationType}`);
					element.style.opacity = "1";
				}, delay);

				observer.unobserve(entry.target);
			}
		}
	}, observerOptions);

	// Observe sections with fade-in-up
	const sections = document.querySelectorAll("section");
	for (const section of sections) {
		section.style.opacity = "0";
		(section as HTMLElement).dataset.animation = "fade-in-up";
		observer.observe(section);
	}

	// Observe cards with staggered entrance
	const cards = document.querySelectorAll("[data-project-card], article");
	cards.forEach((card, index) => {
		const htmlCard = card as HTMLElement;
		htmlCard.style.opacity = "0";

		// Alternate between slide-in-left and slide-in-right
		const animations = ["slide-in-left", "slide-in-right", "scale-in"];
		htmlCard.dataset.animation = animations[index % 3];
		htmlCard.dataset.delay = `${index * 100}`;

		observer.observe(card);
	});
}

// Enhanced card hover effects with depth
function initCardHoverEffects(): void {
	const cards = document.querySelectorAll(
		"[data-project-card], .card-elevated, .metric-card",
	);

	for (const card of cards) {
		card.addEventListener("mouseenter", () => {
			card.classList.add("-translate-y-2", "shadow-2xl");

			// Add glow effect to accent elements
			const accentBars = card.querySelectorAll(".accent-bar-left");
			for (const bar of accentBars) {
				bar.classList.add("opacity-100");
			}
		});

		card.addEventListener("mouseleave", () => {
			card.classList.remove("-translate-y-2", "shadow-2xl");

			const accentBars = card.querySelectorAll(".accent-bar-left");
			for (const bar of accentBars) {
				bar.classList.remove("opacity-100");
			}
		});
	}
}

// Animated number counting for metrics
function initMetricCounters(): void {
	const metrics = document.querySelectorAll("[data-metric-value]");

	const observerOptions = {
		threshold: 0.5,
	};

	const observer = new IntersectionObserver((entries) => {
		for (const entry of entries) {
			if (entry.isIntersecting) {
				const element = entry.target as HTMLElement;
				const targetValue = element.dataset.metricValue || "0";
				animateCounter(element, targetValue);
				observer.unobserve(entry.target);
			}
		}
	}, observerOptions);

	for (const metric of metrics) {
		observer.observe(metric);
	}
}

function animateCounter(element: HTMLElement, targetText: string): void {
	// Extract number from text like "5-8 s" or "91%"
	const match = targetText.match(/\d+/);
	if (!match) {
		element.textContent = targetText;
		return;
	}

	const targetNumber = Number.parseInt(match[0], 10);
	const suffix = targetText.replace(match[0], "");
	const duration = 1500;
	const steps = 60;
	const increment = targetNumber / steps;
	let current = 0;

	const timer = setInterval(() => {
		current += increment;
		if (current >= targetNumber) {
			element.textContent = targetText;
			clearInterval(timer);
		} else {
			element.textContent = Math.floor(current) + suffix;
		}
	}, duration / steps);
}

// Hero section enhanced animation
function initHeroAnimation(): void {
	const heroTitle = document.querySelector("h1");
	const heroSubtitle = document.querySelector("main section:first-of-type p");
	const heroCTA = document.querySelector("main section:first-of-type .flex");

	if (heroTitle) {
		heroTitle.style.opacity = "0";
		heroTitle.style.transform = "translateY(30px)";

		setTimeout(() => {
			heroTitle.style.transition = "all 1s cubic-bezier(0.16, 1, 0.3, 1)";
			heroTitle.style.opacity = "1";
			heroTitle.style.transform = "translateY(0)";
		}, 200);
	}

	if (heroSubtitle) {
		const subtitleEl = heroSubtitle as HTMLElement;
		subtitleEl.style.opacity = "0";
		subtitleEl.style.transform = "translateY(20px)";

		setTimeout(() => {
			subtitleEl.style.transition = "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)";
			subtitleEl.style.opacity = "1";
			subtitleEl.style.transform = "translateY(0)";
		}, 400);
	}

	if (heroCTA) {
		const ctaEl = heroCTA as HTMLElement;
		ctaEl.style.opacity = "0";
		ctaEl.style.transform = "translateY(20px)";

		setTimeout(() => {
			ctaEl.style.transition = "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)";
			ctaEl.style.opacity = "1";
			ctaEl.style.transform = "translateY(0)";
		}, 600);
	}
}

// Smooth scroll behavior for anchor links
function initSmoothScroll(): void {
	const links = document.querySelectorAll('a[href^="#"]');

	for (const link of links) {
		link.addEventListener("click", (e) => {
			const href = link.getAttribute("href");
			if (!href || href === "#") return;

			const target = document.querySelector(href);
			if (target) {
				e.preventDefault();
				target.scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
			}
		});
	}
}

// Scroll progress indicator
function initScrollProgress(): void {
	const progressBar = document.createElement("div");
	progressBar.className =
		"fixed top-0 left-0 h-1 bg-gradient-to-r from-primary via-accent to-primary z-50 transition-all duration-150";
	progressBar.style.width = "0%";
	document.body.appendChild(progressBar);

	let ticking = false;

	window.addEventListener("scroll", () => {
		if (!ticking) {
			window.requestAnimationFrame(() => {
				const scrollPercentage =
					(window.scrollY /
						(document.documentElement.scrollHeight - window.innerHeight)) *
					100;
				progressBar.style.width = `${Math.min(scrollPercentage, 100)}%`;
				ticking = false;
			});

			ticking = true;
		}
	});
}

// Enhanced button ripple effect
function initButtonRipple(): void {
	const buttons = document.querySelectorAll(
		"button, a.btn-primary-enhanced, a.btn-secondary-enhanced, a[class*='rounded-full']",
	);

	for (const button of buttons) {
		button.addEventListener("click", (e) => {
			if (!(e instanceof MouseEvent)) return;

			const rect = button.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;

			const ripple = document.createElement("span");
			ripple.className =
				"absolute rounded-full bg-white/30 pointer-events-none animate-ping";
			ripple.style.width = "20px";
			ripple.style.height = "20px";
			ripple.style.left = `${x}px`;
			ripple.style.top = `${y}px`;
			ripple.style.transform = "translate(-50%, -50%)";

			const buttonEl = button as HTMLElement;
			if (getComputedStyle(buttonEl).position === "static") {
				buttonEl.style.position = "relative";
			}
			buttonEl.style.overflow = "hidden";

			buttonEl.appendChild(ripple);

			setTimeout(() => ripple.remove(), 600);
		});
	}
}

// Sticky header with blur on scroll
function initStickyHeader(): void {
	const header = document.querySelector("header");
	if (!header) return;

	let lastScroll = 0;

	window.addEventListener("scroll", () => {
		const currentScroll = window.scrollY;

		if (currentScroll > 100) {
			const headerEl = header as HTMLElement;
			headerEl.style.backdropFilter = "blur(12px)";
			headerEl.style.setProperty("-webkit-backdrop-filter", "blur(12px)");
			header.classList.add("bg-slate-950/90", "shadow-lg");
			header.classList.remove("bg-transparent");
		} else {
			const headerEl = header as HTMLElement;
			headerEl.style.backdropFilter = "";
			headerEl.style.setProperty("-webkit-backdrop-filter", "");
			header.classList.remove("bg-slate-950/90", "shadow-lg");
			header.classList.add("bg-transparent");
		}

		// Hide header on scroll down, show on scroll up
		if (currentScroll > lastScroll && currentScroll > 200) {
			header.style.transform = "translateY(-100%)";
		} else {
			header.style.transform = "translateY(0)";
		}

		lastScroll = currentScroll;
	});

	// Add transition
	header.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
	header.classList.add("sticky", "top-0", "z-40");
}

// Badge hover effects
function initBadgeHovers(): void {
	const badges = document.querySelectorAll("[class*='badge-']");

	for (const badge of badges) {
		badge.addEventListener("mouseenter", () => {
			badge.classList.add("scale-110", "z-10");
		});

		badge.addEventListener("mouseleave", () => {
			badge.classList.remove("scale-110", "z-10");
		});
	}
}

// Parallax effect for decorative elements (very subtle)
function initParallaxEffect(): void {
	const parallaxElements = document.querySelectorAll("[data-parallax]");
	if (parallaxElements.length === 0) return;

	let ticking = false;

	window.addEventListener("scroll", () => {
		if (!ticking) {
			window.requestAnimationFrame(() => {
				const scrolled = window.scrollY;

				for (const element of parallaxElements) {
					const htmlElement = element as HTMLElement;
					const speed = Number.parseFloat(
						htmlElement.dataset.parallax || "0.5",
					);
					const translateY = scrolled * speed;
					htmlElement.style.transform = `translateY(${translateY}px)`;
				}

				ticking = false;
			});

			ticking = true;
		}
	});
}

// Add CSS for animations if not already present
function injectAnimationStyles(): void {
	// Check if styles already exist
	if (document.querySelector("#dynamic-animations")) return;

	const style = document.createElement("style");
	style.id = "dynamic-animations";
	style.textContent = `
    /* Dynamic animation enhancements */
    .accent-bar-left {
      opacity: 0.7;
      transition: opacity 0.3s ease;
    }

    .accent-bar-left.opacity-100 {
      opacity: 1 !important;
    }

    /* Card elevation on hover */
    [data-project-card],
    .card-elevated,
    .metric-card {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Smooth transform origins */
    [data-project-card]:hover,
    .card-elevated:hover,
    .metric-card:hover {
      transform-origin: center;
    }

    /* Badge scale animation */
    [class*='badge-'] {
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
  `;
	document.head.appendChild(style);
}

// Initialize all animations
export function initAnimations(): void {
	// Respect user's motion preferences
	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
		console.log("[animations] Reduced motion preferred, skipping animations");
		return;
	}

	injectAnimationStyles();
	initHeroAnimation();
	initScrollAnimations();
	initCardHoverEffects();
	initSmoothScroll();
	initButtonRipple();
	initStickyHeader();
	initBadgeHovers();
	initMetricCounters();
	initScrollProgress();

	// Parallax effect for hero decoration
	initParallaxEffect();

	console.log("[animations] Professional animations initialized");
}

// Auto-initialize on DOM ready
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initAnimations);
} else {
	initAnimations();
}
