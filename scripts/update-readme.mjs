import { readFile, writeFile } from "node:fs/promises";

const USERNAME = "nabilkencana";
const README_PATH = new URL("../README.md", import.meta.url);
const FEATURED_DATA_PATH = new URL("../data/featured-projects.json", import.meta.url);

const ACTIVITY_START = "<!-- AUTO:ACTIVITY:START -->";
const ACTIVITY_END = "<!-- AUTO:ACTIVITY:END -->";

const FEATURED_START = "<!-- AUTO:FEATURED:START -->";
const FEATURED_END = "<!-- AUTO:FEATURED:END -->";

const dryRun = process.argv.includes("--dry-run");
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

const headers = {
  "Accept": "application/vnd.github+json",
  "User-Agent": "nabilkencana-profile-readme"
};

if (token) {
  headers.Authorization = `Bearer ${token}`;
}

async function githubFetch(url) {
  let res = await fetch(url, { headers });
  if (res.status === 401 && headers.Authorization) {
    const noAuthHeaders = { ...headers };
    delete noAuthHeaders.Authorization;
    res = await fetch(url, { headers: noAuthHeaders });
  }
  return res;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

function eventToLine(event) {
  const repo = event.repo?.name;
  if (!repo) return null;

  const date = formatDate(event.created_at);
  const repoLink = `https://github.com/${repo}`;

  switch (event.type) {
    case "PushEvent": {
      const commits = event.payload?.commits?.length || 1;
      const label = commits === 1 ? "commit" : "commits";
      return `- ${date}: pushed ${commits} ${label} to [${repo}](${repoLink}).`;
    }
    case "CreateEvent": {
      const refType = event.payload?.ref_type || "resource";
      return `- ${date}: created a ${refType} in [${repo}](${repoLink}).`;
    }
    case "ForkEvent": {
      const forkName = event.payload?.forkee?.full_name;
      const forkUrl = event.payload?.forkee?.html_url || repoLink;
      const suffix = forkName ? ` → [${forkName}](${forkUrl})` : "";
      return `- ${date}: forked [${repo}](${repoLink})${suffix}.`;
    }
    case "PullRequestEvent": {
      const action = event.payload?.action || "updated";
      const number = event.payload?.pull_request?.number;
      const prUrl = event.payload?.pull_request?.html_url || repoLink;
      const suffix = number ? ` [#${number}](${prUrl})` : "";
      return `- ${date}: ${action} pull request${suffix} in [${repo}](${repoLink}).`;
    }
    case "IssuesEvent": {
      const action = event.payload?.action || "updated";
      const number = event.payload?.issue?.number;
      const issueUrl = event.payload?.issue?.html_url || repoLink;
      const suffix = number ? ` [#${number}](${issueUrl})` : "";
      return `- ${date}: ${action} issue${suffix} in [${repo}](${repoLink}).`;
    }
    default:
      return null;
  }
}

async function fetchRecentActivity() {
  try {
    const response = await githubFetch(`https://api.github.com/users/${USERNAME}/events/public?per_page=40`);

    if (!response.ok) {
      console.warn(`GitHub API returned ${response.status} ${response.statusText} for recent activity`);
      return null;
    }

    const events = await response.json();
    const seen = new Set();
    const lines = events
      .map(event => {
        const line = eventToLine(event);
        if (!line) return null;
        const key = event.type === "PushEvent"
          ? `PushEvent::${event.repo?.name}::${formatDate(event.created_at)}`
          : line;
        if (seen.has(key)) return null;
        seen.add(key);
        return line;
      })
      .filter(Boolean)
      .slice(0, 6);

    if (!lines.length) {
      return "_No recent public activity was found._";
    }

    return lines.join("\n");
  } catch (err) {
    console.warn("Failed to fetch recent activity:", err.message);
    return null;
  }
}

async function fetchFeaturedProjects() {
  const jsonContent = await readFile(FEATURED_DATA_PATH, "utf8");
  const projects = JSON.parse(jsonContent);

  const rows = [];
  rows.push("| Project | Focus | Why it matters |");
  rows.push("| --- | --- | --- |");

  for (const project of projects) {
    let repoDetails = null;
    if (project.repo) {
      try {
        const res = await githubFetch(`https://api.github.com/repos/${project.repo}`);
        if (res.ok) {
          repoDetails = await res.json();
        }
      } catch (e) {
        console.warn(`Failed to fetch repo stats for ${project.repo}:`, e.message);
      }
    }

    const nameCell = `[**${project.name}**](${project.url})`;
    const focusCell = project.focus;
    
    let summary = project.summary;
    if (repoDetails) {
      const stars = repoDetails.stargazers_count || 0;
      const lastPush = repoDetails.pushed_at ? formatDate(repoDetails.pushed_at) : null;
      
      const statsText = [];
      if (stars > 0) {
        statsText.push(`⭐ ${stars} star${stars > 1 ? "s" : ""}`);
      }
      if (lastPush) {
        statsText.push(`🕒 Updated ${lastPush}`);
      }
      
      if (statsText.length > 0) {
        summary += `<br><sub>${statsText.join(" · ")}</sub>`;
      }
    }

    rows.push(`| ${nameCell} | ${focusCell} | ${summary} |`);
  }

  return rows.join("\n");
}

function replaceBlock(content, startMarker, endMarker, nextBlock) {
  const startIndex = content.indexOf(startMarker);
  const endIndex = content.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    return content;
  }

  return [
    content.slice(0, startIndex + startMarker.length),
    "\n",
    nextBlock,
    "\n",
    content.slice(endIndex)
  ].join("");
}

let readme = await readFile(README_PATH, "utf8");

const featuredTable = await fetchFeaturedProjects();
if (featuredTable) {
  readme = replaceBlock(readme, FEATURED_START, FEATURED_END, featuredTable);
}

const activity = await fetchRecentActivity();
if (activity) {
  readme = replaceBlock(readme, ACTIVITY_START, ACTIVITY_END, activity);
}

if (dryRun) {
  console.log("=== FEATURED WORK TABLE ===");
  console.log(featuredTable);
  console.log("\n=== RECENT ACTIVITY ===");
  console.log(activity);
  console.log("\nDry run complete. README.md was not modified.");
} else {
  await writeFile(README_PATH, readme);
  console.log("README.md updated successfully.");
}
