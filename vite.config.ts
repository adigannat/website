import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import fg from "fast-glob";
import { defineConfig } from "vite";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));
const pagesDir = resolve(projectRoot, "src/pages");
const htmlEntries = fg
	.sync("**/*.html", {
		cwd: pagesDir,
	})
	.reduce<Record<string, string>>((entries, file) => {
		const normalized = file.replace(/\\/g, "/");
		const key =
			normalized === "index.html"
				? "index"
				: normalized
						.replace(/\\/g, "/")
						.replace(/\/index\.html$/, "")
						.replace(/\.html$/, "")
						.replace(/\//g, "-");
		entries[key] = resolve(pagesDir, file);
		return entries;
	}, {});

export default defineConfig({
	root: pagesDir,
	publicDir: resolve(projectRoot, "public"),
	server: {
		host: true,
		port: 5173,
	},
	resolve: {
		alias: {
			"@src": resolve(projectRoot, "src"),
			"@css": resolve(projectRoot, "src/css"),
			"@ts": resolve(projectRoot, "src/ts"),
			"@content": resolve(projectRoot, "content"),
			"@templates": resolve(projectRoot, "src/templates"),
		},
	},
	build: {
		outDir: resolve(projectRoot, "dist"),
		emptyOutDir: true,
		rollupOptions: {
			input: htmlEntries,
		},
	},
});
