const filterButtons = Array.from(
	document.querySelectorAll<HTMLButtonElement>("[data-filter]"),
);
const cards = Array.from(
	document.querySelectorAll<HTMLElement>("[data-project-card]"),
);
const statusEl = document.querySelector<HTMLElement>("[data-filter-status]");
const grid = document.querySelector<HTMLElement>("[data-project-grid]");

if (filterButtons.length && cards.length && grid) {
	const emptyState = document.createElement("p");
	emptyState.className =
		"rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-6 text-sm text-slate-300 md:col-span-2";
	emptyState.hidden = true;
	emptyState.textContent =
		"No projects match this filter yet. Choose another filter to explore more work.";
	grid.append(emptyState);

	const update = (value: string) => {
		let visibleCount = 0;
		for (const button of filterButtons) {
			const isActive = button.value === value;
			button.dataset.state = isActive ? "active" : "inactive";
			button.setAttribute("aria-pressed", isActive ? "true" : "false");
		}

		for (const card of cards) {
			const tags = (card.dataset.tags ?? "")
				.split(",")
				.map((tag) => tag.trim())
				.filter(Boolean);
			const shouldShow = value === "all" || tags.includes(value);
			card.toggleAttribute("hidden", !shouldShow);
			card.classList.toggle("hidden", !shouldShow);
			card.setAttribute("aria-hidden", shouldShow ? "false" : "true");
			if (shouldShow) {
				visibleCount += 1;
			}
		}

		emptyState.hidden = visibleCount > 0;
		const humanLabel =
			value === "all"
				? "all projects"
				: (filterButtons
						.find((button) => button.value === value)
						?.textContent?.toLowerCase() ?? value);
		if (statusEl) {
			statusEl.textContent = visibleCount
				? `Showing ${visibleCount} project${visibleCount === 1 ? "" : "s"} filtered by ${humanLabel}.`
				: `No projects match ${humanLabel}. Showing zero results.`;
		}
	};

	for (const button of filterButtons) {
		button.addEventListener("click", () => {
			if (button.dataset.state === "active") return;
			update(button.value);
		});
	}

	update("all");
}
