/**
 * GitHub API proxy with KV caching
 * Caches repository data to reduce API calls and improve performance
 */

interface Env {
	GITHUB_CACHE: KVNamespace;
	GITHUB_TOKEN?: string;
}

interface GitHubRepo {
	name: string;
	full_name: string;
	description: string;
	html_url: string;
	homepage: string | null;
	language: string;
	stargazers_count: number;
	forks_count: number;
	topics: string[];
	created_at: string;
	updated_at: string;
	pushed_at: string;
}

const CACHE_TTL = 3600; // 1 hour in seconds
const REPOS_TO_FETCH = [
	"adigannat/rag-whatsapp-assistant",
	"adigannat/iceberg-lakehouse",
	// Add more repositories as needed
];

export const onRequestGet: PagesFunction<Env> = async (context) => {
	const { request, env } = context;
	const url = new URL(request.url);
	const repo = url.searchParams.get("repo");

	// CORS headers
	const corsHeaders = {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "GET, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type",
	};

	if (request.method === "OPTIONS") {
		return new Response(null, { headers: corsHeaders });
	}

	try {
		// If specific repo requested
		if (repo) {
			const data = await fetchRepoWithCache(repo, env);
			if (!data) {
				return jsonResponse({ error: "Repository not found" }, 404);
			}
			return jsonResponse(data, 200, corsHeaders);
		}

		// Fetch all configured repos
		const repos = await Promise.all(
			REPOS_TO_FETCH.map((repoName) => fetchRepoWithCache(repoName, env)),
		);

		const validRepos = repos.filter((r) => r !== null);

		return jsonResponse(
			{
				count: validRepos.length,
				repositories: validRepos,
			},
			200,
			corsHeaders,
		);
	} catch (error) {
		console.error("GitHub API error:", error);
		return jsonResponse(
			{ error: "Failed to fetch GitHub data" },
			500,
			corsHeaders,
		);
	}
};

async function fetchRepoWithCache(
	repoFullName: string,
	env: Env,
): Promise<GitHubRepo | null> {
	const cacheKey = `github:repo:${repoFullName}`;

	// Try to get from cache
	const cached = await env.GITHUB_CACHE.get(cacheKey, "json");
	if (cached) {
		return cached as GitHubRepo;
	}

	// Fetch from GitHub API
	const data = await fetchFromGitHub(repoFullName, env.GITHUB_TOKEN);

	if (data) {
		// Store in cache with TTL
		await env.GITHUB_CACHE.put(cacheKey, JSON.stringify(data), {
			expirationTtl: CACHE_TTL,
		});
	}

	return data;
}

async function fetchFromGitHub(
	repoFullName: string,
	token?: string,
): Promise<GitHubRepo | null> {
	const headers: Record<string, string> = {
		Accept: "application/vnd.github.v3+json",
		"User-Agent": "Aditya-Portfolio",
	};

	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	try {
		const response = await fetch(
			`https://api.github.com/repos/${repoFullName}`,
			{ headers },
		);

		if (!response.ok) {
			console.error(`GitHub API error for ${repoFullName}: ${response.status}`);
			return null;
		}

		const data = await response.json();

		return {
			name: data.name,
			full_name: data.full_name,
			description: data.description,
			html_url: data.html_url,
			homepage: data.homepage,
			language: data.language,
			stargazers_count: data.stargazers_count,
			forks_count: data.forks_count,
			topics: data.topics || [],
			created_at: data.created_at,
			updated_at: data.updated_at,
			pushed_at: data.pushed_at,
		};
	} catch (error) {
		console.error(`Failed to fetch ${repoFullName}:`, error);
		return null;
	}
}

function jsonResponse(
	data: unknown,
	status = 200,
	additionalHeaders: Record<string, string> = {},
): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			"Content-Type": "application/json",
			"Cache-Control": "public, max-age=3600",
			...additionalHeaders,
		},
	});
}
