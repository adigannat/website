/**
 * Pa11y CI accessibility test runner
 * Tests WCAG 2.2 AA compliance on built pages
 */

import { execSync } from "node:child_process";

const urls = [
	"http://localhost:4173/",
	"http://localhost:4173/projects/",
	"http://localhost:4173/case-studies/",
	"http://localhost:4173/about/",
	"http://localhost:4173/contact/",
];

console.log("[a11y] Starting Vite preview server...");
const server = execSync("npm run preview &", { stdio: "ignore" });

// Wait for server to start
await new Promise((resolve) => setTimeout(resolve, 3000));

console.log("[a11y] Running Pa11y accessibility tests for WCAG 2.2 AA...");

try {
	execSync(`npx pa11y-ci ${urls.join(" ")} --standard WCAG2AA --reporter cli`, {
		stdio: "inherit",
	});
	console.log("[a11y] ✅ All accessibility tests passed!");
	process.exit(0);
} catch (error) {
	console.error("[a11y] ❌ Accessibility tests failed");
	process.exit(1);
}
