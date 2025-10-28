/**
 * Contact form submission handler with Cloudflare Turnstile verification
 * Sends email via Resend API and validates spam protection
 */

interface Env {
	TURNSTILE_SECRET_KEY: string;
	RESEND_API_KEY: string;
	ENVIRONMENT: string;
}

interface ContactFormData {
	name: string;
	email: string;
	message: string;
	context: string;
	"cf-turnstile-response": string;
}

interface TurnstileResponse {
	success: boolean;
	"error-codes"?: string[];
	challenge_ts?: string;
	hostname?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
	const { request, env } = context;

	// CORS preflight
	if (request.method === "OPTIONS") {
		return new Response(null, {
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "POST, OPTIONS",
				"Access-Control-Allow-Headers": "Content-Type",
			},
		});
	}

	try {
		// Parse form data
		const formData = await request.formData();
		const data: Partial<ContactFormData> = {};

		for (const [key, value] of formData.entries()) {
			data[key as keyof ContactFormData] = value.toString();
		}

		// Validate required fields
		const { name, email, message, "cf-turnstile-response": token } = data;

		if (!name || !email || !message) {
			return jsonResponse(
				{ success: false, error: "Missing required fields" },
				400,
			);
		}

		// Email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return jsonResponse(
				{ success: false, error: "Invalid email address" },
				400,
			);
		}

		// Verify Turnstile token
		if (!token) {
			return jsonResponse(
				{ success: false, error: "Turnstile verification required" },
				400,
			);
		}

		const turnstileValid = await verifyTurnstile(
			token,
			env.TURNSTILE_SECRET_KEY,
			request.headers.get("CF-Connecting-IP") || "",
		);

		if (!turnstileValid) {
			return jsonResponse(
				{ success: false, error: "Turnstile verification failed" },
				403,
			);
		}

		// Send email via Resend
		const emailSent = await sendEmail(
			{
				name,
				email,
				message,
				context: data.context || "contact-page",
			},
			env.RESEND_API_KEY,
		);

		if (!emailSent) {
			return jsonResponse(
				{
					success: false,
					error: "Failed to send message. Please try again or email directly.",
				},
				500,
			);
		}

		return jsonResponse({
			success: true,
			message: "Message sent successfully! I'll reply within 2 business days.",
		});
	} catch (error) {
		console.error("Contact form error:", error);
		return jsonResponse(
			{
				success: false,
				error: "An unexpected error occurred. Please try again later.",
			},
			500,
		);
	}
};

async function verifyTurnstile(
	token: string,
	secret: string,
	ip: string,
): Promise<boolean> {
	try {
		const response = await fetch(
			"https://challenges.cloudflare.com/turnstile/v0/siteverify",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					secret,
					response: token,
					remoteip: ip,
				}),
			},
		);

		const data = (await response.json()) as TurnstileResponse;
		return data.success;
	} catch (error) {
		console.error("Turnstile verification error:", error);
		return false;
	}
}

async function sendEmail(
	data: { name: string; email: string; message: string; context: string },
	apiKey: string,
): Promise<boolean> {
	try {
		const response = await fetch("https://api.resend.com/emails", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				from: "Portfolio Contact <noreply@your-domain.example>",
				to: "adigannat@gmail.com",
				reply_to: data.email,
				subject: `Portfolio Contact: ${data.name}`,
				html: `
					<h2>New Contact Form Submission</h2>
					<p><strong>From:</strong> ${escapeHtml(data.name)} (${escapeHtml(data.email)})</p>
					<p><strong>Context:</strong> ${escapeHtml(data.context)}</p>
					<p><strong>Message:</strong></p>
					<p>${escapeHtml(data.message).replace(/\n/g, "<br>")}</p>
				`,
			}),
		});

		return response.ok;
	} catch (error) {
		console.error("Email send error:", error);
		return false;
	}
}

function escapeHtml(text: string): string {
	const map: Record<string, string> = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': "&quot;",
		"'": "&#039;",
	};
	return text.replace(/[&<>"']/g, (char) => map[char]);
}

function jsonResponse(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": "*",
		},
	});
}
