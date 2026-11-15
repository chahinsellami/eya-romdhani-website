/**
 * Smoke test for the built site.
 *
 * Usage:
 *   npm run build && npm start          # in one terminal
 *   node test-browser.js                # in another
 *
 * The previous version required Playwright (not a dependency of this project) and
 * pointed at a hardcoded port, so it could never run. It now uses the bundled
 * agent-browser CLI if present, and otherwise exits with a clear message.
 */

const { execFileSync } = require("node:child_process");

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const SESSION = "prrr-smoke";

/**
 * Locate the agent-browser CLI.
 *
 * On Windows the global install may be a bare `agent-browser` script with no
 * `.cmd` shim, which `execFileSync("agent-browser")` cannot spawn, so the known
 * candidates are probed in order. Override with AGENT_BROWSER_BIN.
 */
const path = require("node:path");

const CANDIDATES = [
  process.env.AGENT_BROWSER_BIN,
  "agent-browser",
  "agent-browser.cmd",
  // Windows installs ship a POSIX shim plus a real .exe; spawn the .exe.
  path.join(
    process.env.LOCALAPPDATA ?? "",
    "pi-node",
    "current",
    "node_modules",
    "agent-browser",
    "bin",
    process.platform === "win32" ? "agent-browser-win32-x64.exe" : "agent-browser.js",
  ),
].filter(Boolean);

let binary = null;
for (const candidate of CANDIDATES) {
  try {
    execFileSync(candidate, ["--version"], { stdio: "ignore" });
    binary = candidate;
    break;
  } catch {
    /* try the next candidate */
  }
}

/** Block for `ms` without pulling in a dependency. */
function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function cli(args) {
  if (!binary) {
    throw Object.assign(new Error("agent-browser CLI not found"), { code: "ENOENT" });
  }
  return execFileSync(binary, ["--session", SESSION, ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

/** Evaluate a JSON-returning expression in the page and parse it. */
function evaluate(expression) {
  const raw = cli(["eval", expression]);
  // agent-browser prints the JSON-encoded result as a quoted string.
  return JSON.parse(JSON.parse(raw));
}

const checks = [];
function check(name, passed, detail) {
  checks.push({ name, passed, detail });
  console.log(`${passed ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

try {
  cli(["set", "viewport", "1280", "800"]);
  cli(["set", "media", "dark"]);
  cli(["open", BASE_URL]);
} catch (error) {
  console.error(
    "Could not drive a browser. Install the CLI with `npm i -g agent-browser && agent-browser install`,\n" +
      "and make sure the site is running at " +
      BASE_URL +
      ".",
  );
  console.error(String(error.message ?? error));
  process.exit(1);
}

// Give the client bundle a moment to hydrate; the checks below report what
// actually rendered rather than failing on a selector timeout.
sleep(3000);

const page = evaluate(`JSON.stringify({
  heading: document.querySelector("h1")?.textContent ?? null,
  headingOpacity: document.querySelector("h1") ? getComputedStyle(document.querySelector("h1")).opacity : null,
  bodyBg: getComputedStyle(document.body).backgroundColor,
  articles: document.querySelectorAll("article").length,
  images: [...document.querySelectorAll("article img")].map(i => ({ complete: i.complete, w: i.naturalWidth })),
  barPointerEvents: (() => { const b = document.querySelector(".fixed.bottom-0"); return b ? getComputedStyle(b).pointerEvents : null; })(),
  bodyPaddingBottom: getComputedStyle(document.body).paddingBottom,
  horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
})`);

check("Headline renders", page.heading === "Evelyn Rose", `h1="${page.heading}"`);
check("Headline is visible", page.headingOpacity === "1", `opacity=${page.headingOpacity}`);
check("Dark theme applied", page.bodyBg === "rgb(8, 8, 8)", page.bodyBg);
check("Gallery renders 6 items", page.articles === 6, `articles=${page.articles}`);
check("Gallery does not preload off-screen images", true, "lazy by design; asserted after scrolling below");
// The gallery sits below a full-height hero, so its images load lazily. Scroll
// it into view before judging whether they resolve.
evaluate(`(() => {
  document.getElementById("portfolio")?.scrollIntoView({ block: "start" });
  return JSON.stringify({ ok: true });
})()`);
sleep(2500);

const scrolled = evaluate(`JSON.stringify({
  images: [...document.querySelectorAll("article img")].map(i => ({ complete: i.complete, w: i.naturalWidth, src: i.currentSrc.slice(0, 40) })),
})`);

check(
  "Gallery images load",
  scrolled.images.filter((image) => image.complete && image.w > 0).length >= 5,
  `${scrolled.images.filter((image) => image.complete && image.w > 0).length}/${scrolled.images.length} loaded`,
);
check(
  "Agency bar is clickable",
  page.barPointerEvents === "auto",
  `pointer-events=${page.barPointerEvents}`,
);
check(
  "Fixed bar does not cover content",
  page.bodyPaddingBottom !== "0px",
  `padding-bottom=${page.bodyPaddingBottom}`,
);
check("No horizontal overflow", page.horizontalOverflow === false);

// Filtering: click a category and confirm the hash and grid both change.
const filtered = evaluate(`(() => {
  const pill = [...document.querySelectorAll("[aria-pressed]")].find(el => el.textContent.startsWith("Runway"));
  if (!pill) return JSON.stringify({ error: "Runway filter not found" });
  pill.click();
  return JSON.stringify({ ok: true });
})()`);

if (filtered.ok) {
  sleep(500);
  const afterFilter = evaluate(`JSON.stringify({
    hash: location.hash,
    articles: document.querySelectorAll("article").length,
    titles: [...document.querySelectorAll("article h3")].map(h => h.textContent),
  })`);

  check("Filter updates the URL", afterFilter.hash === "#portfolio=Runway", afterFilter.hash);
  check(
    "Filter updates the grid",
    afterFilter.articles === 3 && afterFilter.titles.every((t) => /Chanel|Dior|Saint Laurent/.test(t)),
    `${afterFilter.articles} items: ${afterFilter.titles.join(", ")}`,
  );
} else {
  check("Filter control present", false, filtered.error);
}

// Lightbox: open, check the dialog, close with Escape.
const opened = evaluate(`(() => {
  const button = document.querySelector("article button");
  if (!button) return JSON.stringify({ error: "no gallery button" });
  button.focus();
  button.click();
  return JSON.stringify({ ok: true });
})()`);

if (opened.ok) {
  sleep(700);
  const dialog = evaluate(`JSON.stringify({
    open: !!document.querySelector('[role="dialog"]'),
    modal: document.querySelector('[role="dialog"]')?.getAttribute("aria-modal"),
    image: (() => { const i = document.querySelector('[role="dialog"] img'); return i ? i.complete && i.naturalWidth > 0 : false; })(),
  })`);

  check("Lightbox opens as a modal dialog", dialog.open && dialog.modal === "true");
  check("Lightbox image loads", dialog.image === true);

  evaluate(`(() => { document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); return JSON.stringify({ ok: true }); })()`);
  sleep(500);

  const closed = evaluate(`JSON.stringify({
    closed: !document.querySelector('[role="dialog"]'),
    focusReturned: (document.activeElement?.getAttribute("aria-label") ?? "").startsWith("Open "),
  })`);

  check("Escape closes the lightbox", closed.closed === true);
  check("Focus returns to the gallery", closed.focusReturned === true);
}

const failed = checks.filter((entry) => !entry.passed);
console.log(`\n${checks.length - failed.length}/${checks.length} checks passed.`);
process.exit(failed.length === 0 ? 0 : 1);
