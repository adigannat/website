import "../css/tailwind.css";
import "./animations";

const yearEl = document.querySelector("[data-current-year]");
if (yearEl) {
	yearEl.textContent = new Date().getFullYear().toString();
}

// Web Vitals RUM tracking
interface Metric {
	name: string;
	value: number;
	rating: "good" | "needs-improvement" | "poor";
	delta: number;
	id: string;
}

function updateVitalDisplay(metric: Metric): void {
	const key = metric.name.toLowerCase();
	const target = document.querySelector<HTMLElement>(
		`[data-vital-value="${key}"]`,
	);
	if (!target) return;

	let displayValue = metric.value;
	if (metric.name === "LCP") {
		displayValue = metric.value / 1000;
		target.textContent = `${displayValue.toFixed(2)} s`;
	} else if (metric.name === "INP") {
		target.textContent = `${Math.round(displayValue)} ms`;
	} else if (metric.name === "CLS") {
		target.textContent = displayValue.toFixed(2);
	} else {
		target.textContent = displayValue.toString();
	}

	target.dataset.rating = metric.rating;
}

function sendToAnalytics(metric: Metric): void {
	// Log to console in development
	console.log("[web-vitals]", metric.name, metric.value, metric.rating);
	updateVitalDisplay(metric);
}

// Lightweight Web Vitals implementation
function observeLCP(): void {
	const observer = new PerformanceObserver((list) => {
		const entries = list.getEntries();
		const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
			renderTime?: number;
			loadTime?: number;
		};

		const value = lastEntry.renderTime || lastEntry.loadTime || 0;
		const rating =
			value <= 2500 ? "good" : value <= 4000 ? "needs-improvement" : "poor";

		sendToAnalytics({
			name: "LCP",
			value,
			rating,
			delta: value,
			id: crypto.randomUUID(),
		});
	});

	try {
		observer.observe({ type: "largest-contentful-paint", buffered: true });
	} catch (e) {
		// LCP not supported
	}
}

function observeINP(): void {
	let maxValue = 0;

	try {
		const observer = new PerformanceObserver((list) => {
			const entries = list.getEntries() as PerformanceEventTiming[];

			for (const entry of entries) {
				const duration = entry.duration;
				if (duration < 40) continue;
				if (duration > maxValue) {
					maxValue = duration;
					const rating =
						duration <= 200
							? "good"
							: duration <= 500
								? "needs-improvement"
								: "poor";

					sendToAnalytics({
						name: "INP",
						value: duration,
						rating,
						delta: duration,
						id: crypto.randomUUID(),
					});
				}
			}
		});

		observer.observe({ type: "event", buffered: true });
	} catch (e) {
		// INP not supported
	}
}

function observeCLS(): void {
	let clsValue = 0;

	const observer = new PerformanceObserver((list) => {
		for (const entry of list.getEntries()) {
			const layoutShiftEntry = entry as PerformanceEntry & {
				hadRecentInput?: boolean;
				value?: number;
			};
			if (!layoutShiftEntry.hadRecentInput && layoutShiftEntry.value) {
				clsValue += layoutShiftEntry.value;
			}
		}
	});

	try {
		observer.observe({ type: "layout-shift", buffered: true });

		// Report CLS when page visibility changes
		document.addEventListener("visibilitychange", () => {
			if (document.visibilityState === "hidden") {
				const rating =
					clsValue <= 0.1
						? "good"
						: clsValue <= 0.25
							? "needs-improvement"
							: "poor";

				sendToAnalytics({
					name: "CLS",
					value: clsValue,
					rating,
					delta: clsValue,
					id: crypto.randomUUID(),
				});
			}
		});
	} catch (e) {
		// CLS not supported
	}
}

// Initialize Web Vitals tracking
if (typeof PerformanceObserver !== "undefined") {
	observeLCP();
	observeINP();
	observeCLS();
}
