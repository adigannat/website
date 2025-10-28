/**
 * Contact form with Cloudflare Turnstile integration
 */

// Turnstile site key (set this via environment variable or from your Cloudflare dashboard)
const TURNSTILE_SITE_KEY = "0x4AAAAAAAyourSiteKeyHere";

declare global {
	interface Window {
		turnstile?: {
			render: (
				container: string | HTMLElement,
				options: {
					sitekey: string;
					callback?: (token: string) => void;
					"error-callback"?: () => void;
					theme?: "light" | "dark";
				},
			) => string;
			reset: (widgetId: string) => void;
			remove: (widgetId: string) => void;
			getResponse: (widgetId: string) => string;
		};
	}
}

let turnstileWidgetId: string | null = null;

function loadTurnstileScript(): Promise<void> {
	return new Promise((resolve, reject) => {
		if (window.turnstile) {
			resolve();
			return;
		}

		const script = document.createElement("script");
		script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
		script.async = true;
		script.defer = true;
		script.onload = () => resolve();
		script.onerror = () => reject(new Error("Failed to load Turnstile script"));
		document.head.appendChild(script);
	});
}

function initTurnstile(): void {
	const container = document.querySelector("[data-turnstile-container]");
	if (!container || !window.turnstile) return;

	try {
		turnstileWidgetId = window.turnstile.render(container as HTMLElement, {
			sitekey: TURNSTILE_SITE_KEY,
			theme: "dark",
			callback: (_token: string) => {
				console.log("[turnstile] Challenge completed");
			},
			"error-callback": () => {
				console.error("[turnstile] Challenge failed");
				showStatus(
					"Verification failed. Please refresh and try again.",
					"error",
				);
			},
		});
	} catch (error) {
		console.error("[turnstile] Failed to render widget:", error);
	}
}

function showStatus(message: string, type: "success" | "error" | "info"): void {
	const statusContainer = document.querySelector("[data-form-status]");
	if (!statusContainer) return;

	const colorClass =
		type === "success"
			? "text-green-400"
			: type === "error"
				? "text-red-400"
				: "text-slate-300";

	statusContainer.innerHTML = `<p class="${colorClass}">${message}</p>`;
}

async function handleSubmit(event: Event): Promise<void> {
	event.preventDefault();

	const form = event.target as HTMLFormElement;
	const submitButton = form.querySelector(
		'button[type="submit"]',
	) as HTMLButtonElement;
	const formData = new FormData(form);

	// Get Turnstile response
	if (window.turnstile && turnstileWidgetId) {
		const token = window.turnstile.getResponse(turnstileWidgetId);
		if (!token) {
			showStatus("Please complete the verification challenge.", "error");
			return;
		}
		formData.append("cf-turnstile-response", token);
	}

	// Disable submit button
	if (submitButton) {
		submitButton.disabled = true;
		submitButton.textContent = "Sending...";
	}

	showStatus("Sending message...", "info");

	try {
		const response = await fetch("/api/contact", {
			method: "POST",
			body: formData,
		});

		const data = await response.json();

		if (response.ok && data.success) {
			showStatus(data.message || "Message sent successfully!", "success");
			form.reset();

			// Reset Turnstile
			if (window.turnstile && turnstileWidgetId) {
				window.turnstile.reset(turnstileWidgetId);
			}
		} else {
			showStatus(
				data.error || "Failed to send message. Please try again.",
				"error",
			);

			// Reset Turnstile on error
			if (window.turnstile && turnstileWidgetId) {
				window.turnstile.reset(turnstileWidgetId);
			}
		}
	} catch (error) {
		console.error("[contact] Submission error:", error);
		showStatus(
			"Network error. Please check your connection and try again.",
			"error",
		);

		// Reset Turnstile on error
		if (window.turnstile && turnstileWidgetId) {
			window.turnstile.reset(turnstileWidgetId);
		}
	} finally {
		// Re-enable submit button
		if (submitButton) {
			submitButton.disabled = false;
			submitButton.textContent = "Send message";
		}
	}
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
	const form = document.querySelector("[data-contact-form]") as HTMLFormElement;

	if (form) {
		// Load Turnstile
		loadTurnstileScript()
			.then(() => {
				initTurnstile();
			})
			.catch((error) => {
				console.error("[contact] Failed to load Turnstile:", error);
				showStatus(
					"Verification system unavailable. Please email directly.",
					"error",
				);
			});

		// Handle form submission
		form.addEventListener("submit", handleSubmit);
	}
});
