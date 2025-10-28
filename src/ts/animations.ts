/**
 * Subtle animations and interactions
 * Enhances user experience without being distracting
 */

// Fade-in animation for elements as they enter viewport
function initScrollAnimations(): void {
	const observerOptions = {
		threshold: 0.1,
		rootMargin: "0px 0px -50px 0px",
	};

	const observer = new IntersectionObserver((entries) => {
		for (const entry of entries) {
			if (entry.isIntersecting) {
				entry.target.classList.add("animate-fade-in");
				observer.unobserve(entry.target);
			}
		}
	}, observerOptions);

	// Observe all main sections and cards
	const elements = document.querySelectorAll(
		"section, article, .project-card, .case-study-card",
	);
	for (const el of elements) {
		el.classList.add("opacity-0");
		observer.observe(el);
	}
}

// Smooth hover effects for project cards
function initCardHoverEffects(): void {
	const cards = document.querySelectorAll("[data-project-card]");

	for (const card of cards) {
		card.addEventListener("mouseenter", () => {
			card.classList.add("scale-[1.02]");
		});

		card.addEventListener("mouseleave", () => {
			card.classList.remove("scale-[1.02]");
		});
	}
}

// Typing animation for hero text (optional, subtle)
function initHeroAnimation(): void {
	const heroText = document.querySelector("h1");
	if (!heroText || heroText.getAttribute("data-animated")) return;

	heroText.setAttribute("data-animated", "true");
	heroText.style.opacity = "0";

	setTimeout(() => {
		heroText.style.transition = "opacity 0.8s ease-in";
		heroText.style.opacity = "1";
	}, 100);
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

// Parallax effect for hero section (subtle)
function initParallaxEffect(): void {
	const hero = document.querySelector("main");
	if (!hero) return;

	let ticking = false;

	window.addEventListener("scroll", () => {
		if (!ticking) {
			window.requestAnimationFrame(() => {
				const scrolled = window.scrollY;
				const translateY = scrolled * 0.3;
				hero.style.transform = `translateY(${translateY}px)`;
				ticking = false;
			});

			ticking = true;
		}
	});
}

// Add ripple effect to buttons
function initButtonRipple(): void {
	const buttons = document.querySelectorAll(
		"button, a.btn, a[class*='rounded-full']",
	);

	for (const button of buttons) {
		button.addEventListener("click", (e) => {
			if (!(e instanceof MouseEvent)) return;
			const rect = button.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;

			const ripple = document.createElement("span");
			ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        width: 20px;
        height: 20px;
        left: ${x}px;
        top: ${y}px;
        transform: translate(-50%, -50%) scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
      `;

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

// Add CSS for animations
function injectAnimationStyles(): void {
	const style = document.createElement("style");
	style.textContent = `
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-fade-in {
      animation: fadeIn 0.6s ease-out forwards;
    }

    @keyframes ripple {
      to {
        transform: translate(-50%, -50%) scale(20);
        opacity: 0;
      }
    }

    [data-project-card] {
      transition: transform 0.2s ease, border-color 0.2s ease;
    }

    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
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

	// Parallax is opt-in due to performance considerations
	// Uncomment to enable: initParallaxEffect();
	void initParallaxEffect; // Keep function for future use

	console.log("[animations] Initialized");
}

// Auto-initialize on DOM ready
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initAnimations);
} else {
	initAnimations();
}
