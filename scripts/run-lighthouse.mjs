/**
 * Lighthouse CI performance test runner
 * Tests performance budgets and Core Web Vitals
 */

import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

// Performance budgets
const budgets = {
	performance: 90,
	accessibility: 95,
	"best-practices": 90,
	seo: 95,
	pwa: 0, // Not targeting PWA
};

const urls = [
	"http://localhost:4173/",
	"http://localhost:4173/projects/",
	"http://localhost:4173/case-studies/",
	"http://localhost:4173/contact/",
];

console.log("[lighthouse] Starting Vite preview server...");
execSync("npm run preview &", { stdio: "ignore" });

// Wait for server to start
await new Promise((resolve) => setTimeout(resolve, 3000));

console.log("[lighthouse] Running Lighthouse CI tests...");

try {
	mkdirSync(".lighthouseci", { recursive: true });

	for (const url of urls) {
		console.log(`[lighthouse] Testing ${url}...`);

		const output = execSync(
			`npx lighthouse ${url} --chrome-flags="--headless --no-sandbox --disable-gpu" --output=json --output=html --output-path=.lighthouseci/report`,
			{ encoding: "utf8" },
		);

		// Parse results
		const report = JSON.parse(output);
		const scores = report.categories;

		console.log(`\nScores for ${url}:`);
		console.log(
			`  Performance: ${Math.round(scores.performance.score * 100)}/${budgets.performance}`,
		);
		console.log(
			`  Accessibility: ${Math.round(scores.accessibility.score * 100)}/${budgets.accessibility}`,
		);
		console.log(
			`  Best Practices: ${Math.round(scores["best-practices"].score * 100)}/${budgets["best-practices"]}`,
		);
		console.log(
			`  SEO: ${Math.round(scores.seo.score * 100)}/${budgets.seo}\n`,
		);

		// Check budgets
		const failed = [];
		if (scores.performance.score * 100 < budgets.performance)
			failed.push("Performance");
		if (scores.accessibility.score * 100 < budgets.accessibility)
			failed.push("Accessibility");
		if (scores["best-practices"].score * 100 < budgets["best-practices"])
			failed.push("Best Practices");
		if (scores.seo.score * 100 < budgets.seo) failed.push("SEO");

		if (failed.length > 0) {
			console.error(`❌ Failed budget checks: ${failed.join(", ")}`);
			process.exit(1);
		}
	}

	console.log("[lighthouse] ✅ All Lighthouse tests passed!");
	process.exit(0);
} catch (error) {
	console.error("[lighthouse] ❌ Lighthouse tests failed:", error.message);
	process.exit(1);
}
