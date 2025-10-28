/**
 * Lighthouse CI performance test runner
 * Boots a Vite preview server, audits key routes, and enforces score budgets.
 */

import { execSync, spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const PREVIEW_PORT = 4173;
const PREVIEW_HOST = "127.0.0.1";
const PREVIEW_ORIGIN = `http://${PREVIEW_HOST}:${PREVIEW_PORT}`;

const ROUTES = ["/", "/projects/", "/case-studies/", "/contact/"];

const BUDGETS = {
	performance: 90,
	accessibility: 95,
	"best-practices": 90,
	seo: 95,
	pwa: 0,
};

const isWindows = process.platform === "win32";

console.log("[lighthouse] Starting Vite preview server…");
const preview = spawn(
	isWindows ? "npm.cmd" : "npm",
	[
		"run",
		"preview",
		"--",
		"--host",
		PREVIEW_HOST,
		"--port",
		String(PREVIEW_PORT),
	],
	{
		stdio: "inherit",
		detached: false,
		shell: isWindows,
	},
);

let previewExited = false;
preview.on("exit", (code) => {
	if (code !== 0) {
		previewExited = true;
	}
});

const ready = await waitForServer(`${PREVIEW_ORIGIN}/`, 20_000);
if (!ready || previewExited) {
	console.error("[lighthouse] Preview server did not start in time.");
	await shutdownPreview(preview);
	process.exit(1);
}

console.log("[lighthouse] Preview server ready. Running Lighthouse audits…");

const summary = [];

try {
	mkdirSync(".lighthouseci", { recursive: true });

	for (const route of ROUTES) {
		const url = new URL(route, PREVIEW_ORIGIN).toString();
		const slug =
			route === "/"
				? "index"
				: route.replace(/(^\/|\/$)/g, "").replace(/[^\w-]+/g, "-");
		const basePath = path.join(".lighthouseci", slug || "index");
		const jsonPath = `${basePath}.report.json`;
		const htmlPath = `${basePath}.report.html`;

		console.log(`[lighthouse] Auditing ${url}`);

		execSync(
			`npx lighthouse ${url} --chrome-flags="--headless --no-sandbox --disable-gpu" --output=json --output=html --output-path=${basePath}`,
			{ stdio: "inherit" },
		);

		let report;
		try {
			report = JSON.parse(await readFile(jsonPath, "utf8"));
		} catch {
			const fallback = path.join(".lighthouseci", "report.report.json");
			report = JSON.parse(await readFile(fallback, "utf8"));
			await rm(fallback, { force: true });
		}

		const scores = Object.fromEntries(
			Object.entries(report.categories).map(([key, value]) => [
				key,
				Math.round(value.score * 100),
			]),
		);

		console.log(
			`  Scores → Perf: ${scores.performance} / ${BUDGETS.performance}, ` +
				`Accessibility: ${scores.accessibility} / ${BUDGETS.accessibility}, ` +
				`Best-Practices: ${scores["best-practices"]} / ${BUDGETS["best-practices"]}, ` +
				`SEO: ${scores.seo} / ${BUDGETS.seo}`,
		);

		const failedBudgets = Object.entries(scores)
			.filter(([key, value]) => value < BUDGETS[key])
			.map(([key]) => key);

		if (failedBudgets.length > 0) {
			throw new Error(`Failed budgets for ${url}: ${failedBudgets.join(", ")}`);
		}

		summary.push({ url, scores });

		await rm(jsonPath, { force: true });
		await rm(htmlPath, { force: true });
	}

	await writeFile(
		path.join(".lighthouseci", "summary.json"),
		JSON.stringify(summary, null, 2),
	);

	console.log("[lighthouse] All Lighthouse budgets passed.");
	process.exitCode = 0;
} catch (error) {
	console.error("[lighthouse] Lighthouse run failed:", error.message);
	process.exitCode = 1;
} finally {
	await shutdownPreview(preview);
}

async function waitForServer(url, timeoutMs) {
	const start = Date.now();
	while (Date.now() - start < timeoutMs) {
		try {
			const response = await fetch(url, { method: "HEAD" });
			if (response.ok) {
				return true;
			}
		} catch {
			// Ignore and retry
		}
		await sleep(500);
	}
	return false;
}

async function shutdownPreview(child) {
	if (child.killed) return;
	child.kill("SIGINT");
	await sleep(500);
	if (!child.killed) {
		child.kill("SIGTERM");
		await sleep(500);
	}
	if (!child.killed) {
		child.kill("SIGKILL");
	}
}
