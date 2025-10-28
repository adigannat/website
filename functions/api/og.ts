/**
 * Dynamic OG (Open Graph) image generator
 * Generates social sharing images with SVG-based approach
 */

interface Env {
	ENVIRONMENT: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
	const { request } = context;
	const url = new URL(request.url);

	const title = url.searchParams.get("title") || "Aditya Ganesh";
	const subtitle =
		url.searchParams.get("subtitle") ||
		"Applied ML Engineer | RAG & AWS Iceberg";
	const metric = url.searchParams.get("metric") || "";

	try {
		const svg = generateOGImage(title, subtitle, metric);

		return new Response(svg, {
			headers: {
				"Content-Type": "image/svg+xml",
				"Cache-Control": "public, max-age=86400",
			},
		});
	} catch (error) {
		console.error("OG image generation error:", error);
		return new Response("Error generating image", { status: 500 });
	}
};

function generateOGImage(
	title: string,
	subtitle: string,
	metric: string,
): string {
	const escapedTitle = escapeXml(title);
	const escapedSubtitle = escapeXml(subtitle);
	const escapedMetric = escapeXml(metric);

	// Split title into lines if too long
	const titleLines = wrapText(escapedTitle, 35);
	const titleY = 300 - (titleLines.length - 1) * 30;

	return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1e293b;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#1d4ed8;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0ea5e9;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)" />

  <!-- Decorative elements -->
  <rect x="60" y="60" width="6" height="80" fill="url(#accent)" rx="3" />
  <circle cx="1050" cy="150" r="100" fill="#1e40af" opacity="0.1" />
  <circle cx="1100" cy="500" r="150" fill="#0ea5e9" opacity="0.05" />

  <!-- Content -->
  <g transform="translate(100, ${titleY})">
    ${titleLines
			.map(
				(line, i) =>
					`<text x="0" y="${i * 70}" font-family="system-ui, -apple-system, sans-serif" font-size="60" font-weight="700" fill="#f8fafc">${line}</text>`,
			)
			.join("\n    ")}
  </g>

  <text x="100" y="420" font-family="system-ui, -apple-system, sans-serif" font-size="32" font-weight="400" fill="#94a3b8">${escapedSubtitle}</text>

  ${
		metric
			? `<g transform="translate(100, 490)">
    <rect width="${metric.length * 14 + 40}" height="60" fill="#1e293b" rx="30" />
    <text x="30" y="40" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="600" fill="#0ea5e9">${escapedMetric}</text>
  </g>`
			: ""
	}

  <!-- Branding -->
  <text x="100" y="570" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="500" fill="#475569">adigannat.com</text>
</svg>`;
}

function wrapText(text: string, maxLength: number): string[] {
	if (text.length <= maxLength) return [text];

	const words = text.split(" ");
	const lines: string[] = [];
	let currentLine = "";

	for (const word of words) {
		if ((currentLine + word).length <= maxLength) {
			currentLine += (currentLine ? " " : "") + word;
		} else {
			if (currentLine) lines.push(currentLine);
			currentLine = word;
		}
	}

	if (currentLine) lines.push(currentLine);
	return lines;
}

function escapeXml(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}
