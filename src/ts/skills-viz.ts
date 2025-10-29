/**
 * Skills visualization dashboard
 * Interactive charts showing skill categories and distribution
 */

interface SkillCategory {
	name: string;
	count: number;
	color: string;
}

const CATEGORY_COLORS: Record<string, string> = {
	Languages: "#3b82f6", // blue-500
	"Applied ML": "#0ea5e9", // sky-500
	"Data & Cloud": "#06b6d4", // cyan-500
	Automation: "#8b5cf6", // violet-500
	DevOps: "#10b981", // emerald-500
	Analytics: "#f59e0b", // amber-500
	Strengths: "#ec4899", // pink-500
};

export class SkillsVisualization {
	private container: HTMLElement | null;
	private categories: SkillCategory[] = [];

	constructor() {
		this.container = document.querySelector("[data-skills-viz]");
		if (!this.container) return;

		this.parseSkillsData();
		this.render();
	}

	private parseSkillsData() {
		// Parse from data attributes or DOM
		const sections = document.querySelectorAll("[data-skill-category]");
		for (const section of sections) {
			const name = section.getAttribute("data-skill-category") || "";
			const count = Number.parseInt(
				section.getAttribute("data-skill-count") || "0",
				10,
			);
			const color = CATEGORY_COLORS[name] || "#64748b"; // slate-500 fallback

			this.categories.push({ name, count, color });
		}
	}

	private render() {
		if (!this.container || this.categories.length === 0) return;

		const html = `
      <div class="skills-viz-grid">
        ${this.renderDonutChart()}
        ${this.renderBarChart()}
      </div>
      <div class="skills-viz-stats">
        ${this.renderStats()}
      </div>
    `;

		this.container.innerHTML = html;
		this.attachEventListeners();
	}

	private renderDonutChart(): string {
		const total = this.categories.reduce((sum, cat) => sum + cat.count, 0);
		const centerX = 100;
		const centerY = 100;
		const radius = 70;
		const innerRadius = 45;

		let currentAngle = -90; // Start from top
		const paths: string[] = [];

		for (const category of this.categories) {
			const percentage = (category.count / total) * 100;
			const angle = (percentage / 100) * 360;

			const path = this.createDonutSegment(
				centerX,
				centerY,
				radius,
				innerRadius,
				currentAngle,
				angle,
				category.color,
				category.name,
			);
			paths.push(path);

			currentAngle += angle;
		}

		const totalSkills = this.categories.reduce(
			(sum, cat) => sum + cat.count,
			0,
		);

		return `
      <div class="skills-viz-donut">
        <h3 class="skills-viz-heading">Skills Distribution</h3>
        <svg viewBox="0 0 200 200" class="skills-viz-donut-svg" role="img" aria-label="Skills distribution donut chart">
          <g class="skills-viz-donut-segments">
            ${paths.join("")}
          </g>
          <text x="100" y="95" text-anchor="middle" class="skills-viz-donut-label">
            ${totalSkills}
          </text>
          <text x="100" y="110" text-anchor="middle" class="skills-viz-donut-sublabel">
            Skills
          </text>
        </svg>
        <div class="skills-viz-legend">
          ${this.categories
						.map(
							(cat) => `
            <div class="skills-viz-legend-item">
              <span class="skills-viz-legend-color" style="background-color: ${cat.color}"></span>
              <span class="skills-viz-legend-label">${cat.name}</span>
              <span class="skills-viz-legend-count">${cat.count}</span>
            </div>
          `,
						)
						.join("")}
        </div>
      </div>
    `;
	}

	private createDonutSegment(
		cx: number,
		cy: number,
		radius: number,
		innerRadius: number,
		startAngle: number,
		angle: number,
		color: string,
		label: string,
	): string {
		const toRadians = (deg: number) => (deg * Math.PI) / 180;

		const startRad = toRadians(startAngle);
		const endRad = toRadians(startAngle + angle);

		const x1 = cx + radius * Math.cos(startRad);
		const y1 = cy + radius * Math.sin(startRad);
		const x2 = cx + radius * Math.cos(endRad);
		const y2 = cy + radius * Math.sin(endRad);

		const x3 = cx + innerRadius * Math.cos(endRad);
		const y3 = cy + innerRadius * Math.sin(endRad);
		const x4 = cx + innerRadius * Math.cos(startRad);
		const y4 = cy + innerRadius * Math.sin(startRad);

		const largeArc = angle > 180 ? 1 : 0;

		const path = `
      M ${x1} ${y1}
      A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
      Z
    `;

		return `<path d="${path}" fill="${color}" class="skills-viz-donut-segment" data-label="${label}" opacity="0.9" />`;
	}

	private renderBarChart(): string {
		const maxCount = Math.max(...this.categories.map((c) => c.count));

		return `
      <div class="skills-viz-bars">
        <h3 class="skills-viz-heading">Skills by Category</h3>
        <div class="skills-viz-bars-container">
          ${this.categories
						.map((cat) => {
							const percentage = (cat.count / maxCount) * 100;
							return `
              <div class="skills-viz-bar-row">
                <div class="skills-viz-bar-label">${cat.name}</div>
                <div class="skills-viz-bar-track">
                  <div
                    class="skills-viz-bar-fill"
                    style="width: ${percentage}%; background-color: ${cat.color};"
                    data-count="${cat.count}"
                  >
                    <span class="skills-viz-bar-count">${cat.count}</span>
                  </div>
                </div>
              </div>
            `;
						})
						.join("")}
        </div>
      </div>
    `;
	}

	private renderStats(): string {
		const total = this.categories.reduce((sum, cat) => sum + cat.count, 0);
		const maxCategory = this.categories.reduce((max, cat) =>
			cat.count > max.count ? cat : max,
		);

		return `
      <div class="grid gap-4 md:grid-cols-3">
        <div class="metric-card">
          <div class="metric-card__icon">
            <svg class="h-6 w-6 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div class="flex flex-col gap-1">
            <div class="text-2xl font-bold text-white">${total}</div>
            <div class="text-xs text-slate-400">Total Skills</div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-card__icon">
            <svg class="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <div class="flex flex-col gap-1">
            <div class="text-2xl font-bold text-white">${this.categories.length}</div>
            <div class="text-xs text-slate-400">Categories</div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-card__icon">
            <svg class="h-6 w-6 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div class="flex flex-col gap-1">
            <div class="text-2xl font-bold text-white">${maxCategory.count}</div>
            <div class="text-xs text-slate-400">Largest: ${maxCategory.name}</div>
          </div>
        </div>
      </div>
    `;
	}

	private attachEventListeners() {
		// Donut segment hover effects
		const segments = document.querySelectorAll(".skills-viz-donut-segment");
		for (const segment of segments) {
			segment.addEventListener("mouseenter", (e) => {
				const target = e.currentTarget as SVGPathElement;
				target.setAttribute("opacity", "1");
				target.style.filter = "drop-shadow(0 4px 8px rgba(0,0,0,0.3))";
			});

			segment.addEventListener("mouseleave", (e) => {
				const target = e.currentTarget as SVGPathElement;
				target.setAttribute("opacity", "0.9");
				target.style.filter = "";
			});
		}

		// Bar animation on scroll
		const bars = document.querySelectorAll(".skills-viz-bar-fill");
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						entry.target.classList.add("skills-viz-bar-fill--animated");
					}
				}
			},
			{ threshold: 0.1 },
		);

		for (const bar of bars) {
			observer.observe(bar);
		}
	}
}

/**
 * Initialize skills visualization
 */
export function initSkillsVisualization(): void {
	new SkillsVisualization();
}

// Auto-initialize on page load
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", () => {
		initSkillsVisualization();
	});
} else {
	initSkillsVisualization();
}
