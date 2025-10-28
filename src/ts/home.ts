type GithubRepo = {
	name: string;
	html_url: string;
	description: string | null;
	stargazers_count: number;
	topics?: string[];
	updated_at: string;
};

type GithubResponse =
	| {
			repositories: GithubRepo[];
	  }
	| { count: number; repositories: GithubRepo[] };

function createTopicChip(topic: string): HTMLSpanElement {
	const chip = document.createElement("span");
	chip.className =
		"rounded-full border border-slate-800 bg-slate-900/40 px-2 py-1 text-[0.65rem]";
	chip.textContent = topic;
	return chip;
}

function createRepoCard(repo: GithubRepo): HTMLElement {
	const article = document.createElement("article");
	article.className = "github-card card-elevated";

	const header = document.createElement("div");
	header.className = "github-card__header";

	const nameLink = document.createElement("a");
	nameLink.className = "github-card__repo focus-ring";
	nameLink.href = repo.html_url;
	nameLink.textContent = repo.name;
	nameLink.rel = "noopener noreferrer";

	const stars = document.createElement("span");
	stars.className = "github-card__stars";
	stars.textContent = `★ ${repo.stargazers_count}`;

	header.append(nameLink, stars);

	const description = document.createElement("p");
	description.className = "github-card__summary";
	description.textContent =
		repo.description ??
		"Production-focused repository with documentation in the README.";

	const topicsWrapper = document.createElement("div");
	topicsWrapper.className = "github-card__topics";

	const topics = Array.isArray(repo.topics) ? repo.topics.slice(0, 4) : [];
	if (topics.length === 0) {
		const fallback = createTopicChip("in-progress");
		topicsWrapper.append(fallback);
	} else {
		for (const topic of topics) {
			topicsWrapper.append(createTopicChip(topic));
		}
	}

	const footer = document.createElement("p");
	footer.className = "text-xs text-slate-500";
	const lastUpdated = new Date(repo.updated_at);
	footer.textContent = `Updated ${lastUpdated.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	})}`;

	article.append(header, description, topicsWrapper, footer);
	return article;
}

async function loadGithubActivity(): Promise<void> {
	const grid = document.querySelector<HTMLElement>("[data-github-grid]");
	if (!grid) return;

	try {
		const response = await fetch("/api/github", {
			headers: { Accept: "application/json" },
		});
		if (!response.ok) {
			throw new Error(`GitHub request failed with ${response.status}`);
		}

		const data = (await response.json()) as GithubResponse;
		const repositories =
			"repositories" in data
				? data.repositories
				: (data as { repositories: GithubRepo[] }).repositories;

		grid.innerHTML = "";

		if (!repositories.length) {
			grid.innerHTML =
				'<p class="text-sm text-slate-400">GitHub data is not available right now. Check back soon.</p>';
			return;
		}

		for (const repo of repositories.slice(0, 3)) {
			grid.append(createRepoCard(repo));
		}
	} catch (error) {
		console.error("[home] Failed to load GitHub activity", error);
		grid.innerHTML =
			'<p class="text-sm text-slate-400">Unable to load GitHub activity right now. Visit <a class="focus-ring text-primary underline-offset-2 hover:underline" href="https://github.com/adigannat">github.com/adigannat</a>.</p>';
	}
}

void loadGithubActivity();
