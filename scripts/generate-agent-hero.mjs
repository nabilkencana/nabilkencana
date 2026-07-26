#!/usr/bin/env node

import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const scriptDirectory = fileURLToPath(new URL(".", import.meta.url));
const outputDirectory = resolve(scriptDirectory, "../assets/hero");

const portraitFilter = [
  "crop=360:400:24:200",
  "format=gray",
  "eq=contrast=1.18:brightness=0.04:gamma=0.96",
  "unsharp=3:3:0.35"
].join(",");

const profileLines = [
  { type: "header", value: "nabilkencana@agentlab" },
  { type: "row", key: "Subject", value: "Nabilkencana" },
  { type: "row", key: "Role", value: "Full-Stack Developer" },
  { type: "row", key: "Affiliation", value: "SMK Telkom Malang" },
  { type: "row", key: "Base", value: "Malang, Indonesia" },
  { type: "row", key: "Status", value: "Building / Shipping / Learning" },
  { type: "blank" },
  { type: "section", value: "DEV.STACK" },
  { type: "row", key: "Primary", value: "Flutter & Web Technologies" },
  { type: "row", key: "Backend", value: "Node.js / TypeScript / Go" },
  { type: "row", key: "Focus", value: "Full Stack Developer & Mobile App Developer" },
  { type: "blank" },
  { type: "section", value: "BUILD.LOG" },
  { type: "row", key: "Movite Frontend", value: "Invitation website" },
  { type: "row", key: "Oksigen Medis 24 Jam (Mobile)", value: "Mobile application " },
  { type: "row", key: "Portofolio NabilKencana", value: "Portfolio website NabilKencana" },
  { type: "blank" },
  { type: "section", value: "GRID.LINKS" },
  { type: "row", key: "GitHub", value: "@nabilkencana" },
  { type: "footer", value: "signal.locked > FLUTTER / WEB / Vibe Coding" }
];

const palettes = {
  dark: {
    backgroundStart: "#020617",
    backgroundEnd: "#11152F",
    panel: "#07111F",
    primary: "#E5E7EB",
    muted: "#64748B",
    cyan: "#22D3EE",
    blue: "#38BDF8",
    violet: "#7C3AED",
    green: "#10B981",
    red: "#F87171",
    scanBlend: "screen"
  },
  light: {
    backgroundStart: "#F8FBFF",
    backgroundEnd: "#F5F3FF",
    panel: "#FFFFFF",
    primary: "#172554",
    muted: "#64748B",
    cyan: "#0891B2",
    blue: "#2563EB",
    violet: "#6D28D9",
    green: "#047857",
    red: "#DC2626",
    scanBlend: "multiply"
  }
};

const layouts = {
  desktop: {
    width: 1180,
    height: 610,
    outerRadius: 18,
    titlebar: { x: 3, y: 3, width: 1174, height: 34, radius: 16 },
    visualPanel: { x: 14, y: 64, width: 488, height: 468, radius: 14 },
    infoPanel: { x: 508, y: 48, width: 655, height: 500, radius: 14 },
    visualTitle: { x: 30, y: 62 },
    infoTitle: { x: 524, y: 62 },
    portrait: { columns: 96, rows: 64, x: 78, y: 90, lineHeight: 6.65, fontSize: 6.5 },
    portraitClip: { x: 24, y: 82, width: 470, height: 438, radius: 12 },
    system: { x: 528, y: 82, width: 620, lineHeight: 21.5, fontSize: 14 },
    footerY: 585
  },
  mobile: {
    width: 720,
    height: 1080,
    outerRadius: 22,
    titlebar: { x: 20, y: 20, width: 680, height: 42, radius: 14 },
    visualPanel: { x: 48, y: 94, width: 624, height: 350, radius: 14 },
    infoPanel: { x: 48, y: 470, width: 624, height: 526, radius: 14 },
    visualTitle: { x: 66, y: 116 },
    infoTitle: { x: 66, y: 492 },
    portrait: { columns: 84, rows: 54, x: 180, y: 132, lineHeight: 5.7, fontSize: 6.6 },
    portraitClip: { x: 58, y: 122, width: 604, height: 312, radius: 12 },
    system: { x: 72, y: 520, width: 574, lineHeight: 21, fontSize: 13 },
    footerY: 1045
  }
};

function buildAmbientPortraitLayer(layout, colors, size) {
  const clip = layout.portraitClip;
  const isDesktop = size === "desktop";
  const centerX = clip.x + clip.width * (isDesktop ? 0.52 : 0.5);
  const centerY = clip.y + clip.height * (isDesktop ? 0.48 : 0.43);
  const orbitWidth = clip.width * (isDesktop ? 0.9 : 0.82);
  const orbitHeight = clip.height * (isDesktop ? 0.58 : 0.62);
  const left = clip.x + (isDesktop ? 28 : 34);
  const right = clip.x + clip.width - (isDesktop ? 28 : 34);
  const top = clip.y + (isDesktop ? 46 : 38);
  const bottom = clip.y + clip.height - (isDesktop ? 42 : 30);

  return `<g clip-path="url(#portrait-clip)" class="ambient-map" aria-hidden="true">
  <rect x="${clip.x}" y="${clip.y}" width="${clip.width}" height="${clip.height}" fill="url(#portrait-grid)"/>
  <ellipse cx="${centerX.toFixed(1)}" cy="${centerY.toFixed(1)}" rx="${(orbitWidth * 0.54).toFixed(1)}" ry="${(orbitHeight * 0.54).toFixed(1)}" fill="url(#portrait-halo)"/>
  <ellipse cx="${centerX.toFixed(1)}" cy="${centerY.toFixed(1)}" rx="${(orbitWidth * 0.5).toFixed(1)}" ry="${(orbitHeight * 0.5).toFixed(1)}" fill="none" stroke="${colors.blue}" stroke-width="1" stroke-dasharray="3 14" opacity="0.13">
    <animateTransform attributeName="transform" type="rotate" from="0 ${centerX.toFixed(1)} ${centerY.toFixed(1)}" to="360 ${centerX.toFixed(1)} ${centerY.toFixed(1)}" dur="42s" repeatCount="indefinite"/>
  </ellipse>
  <ellipse cx="${centerX.toFixed(1)}" cy="${centerY.toFixed(1)}" rx="${(orbitWidth * 0.4).toFixed(1)}" ry="${(orbitHeight * 0.38).toFixed(1)}" fill="none" stroke="${colors.violet}" stroke-width="1" stroke-dasharray="28 24" opacity="0.1">
    <animateTransform attributeName="transform" type="rotate" from="360 ${centerX.toFixed(1)} ${centerY.toFixed(1)}" to="0 ${centerX.toFixed(1)} ${centerY.toFixed(1)}" dur="34s" repeatCount="indefinite"/>
  </ellipse>
  <path d="M ${left} ${top} H ${left + (isDesktop ? 42 : 62)} M ${left} ${top} V ${top + (isDesktop ? 42 : 54)} M ${right} ${bottom} H ${right - (isDesktop ? 42 : 62)} M ${right} ${bottom} V ${bottom - (isDesktop ? 42 : 54)}" fill="none" stroke="${colors.cyan}" stroke-width="1.2" opacity="0.2"/>
  <path d="M ${left} ${(centerY + 42).toFixed(1)} C ${(left + 32).toFixed(1)} ${(centerY + 8).toFixed(1)}, ${(centerX - orbitWidth * 0.3).toFixed(1)} ${(centerY + 58).toFixed(1)}, ${(centerX - orbitWidth * 0.19).toFixed(1)} ${(centerY + 27).toFixed(1)}" fill="none" stroke="${colors.blue}" stroke-width="1" opacity="0.12"/>
  <path d="M ${right} ${(centerY - 52).toFixed(1)} C ${(right - 38).toFixed(1)} ${(centerY - 18).toFixed(1)}, ${(centerX + orbitWidth * 0.31).toFixed(1)} ${(centerY - 70).toFixed(1)}, ${(centerX + orbitWidth * 0.2).toFixed(1)} ${(centerY - 30).toFixed(1)}" fill="none" stroke="${colors.green}" stroke-width="1" opacity="0.11"/>
  <g fill="${colors.cyan}">
    <circle cx="${left}" cy="${top}" r="2.2" opacity="0.42"><animate attributeName="opacity" values="0.2;0.58;0.2" dur="5.6s" repeatCount="indefinite"/></circle>
    <circle cx="${right}" cy="${bottom}" r="2.2" opacity="0.42"><animate attributeName="opacity" values="0.58;0.2;0.58" dur="6.4s" repeatCount="indefinite"/></circle>
    <circle cx="${left + (isDesktop ? 12 : 18)}" cy="${(centerY + 48).toFixed(1)}" r="1.7" opacity="0.32"/>
    <circle cx="${right - (isDesktop ? 10 : 16)}" cy="${(centerY - 58).toFixed(1)}" r="1.7" opacity="0.28"/>
  </g>
</g>`;
}

function getSourcePath() {
  const sourceIndex = process.argv.indexOf("--source");

  if (sourceIndex === -1 || !process.argv[sourceIndex + 1]) {
    throw new Error("Usage: node scripts/generate-agent-hero.mjs --source /absolute/path/to/portrait.jpg");
  }

  return resolve(process.argv[sourceIndex + 1]);
}

function readToken(buffer, offset) {
  let index = offset;

  while (index < buffer.length) {
    const value = buffer[index];

    if (value === 35) {
      while (index < buffer.length && buffer[index] !== 10) index += 1;
    } else if ([9, 10, 13, 32].includes(value)) {
      index += 1;
    } else {
      break;
    }
  }

  const start = index;
  while (index < buffer.length && ![9, 10, 13, 32].includes(buffer[index])) index += 1;

  return { value: buffer.subarray(start, index).toString("ascii"), offset: index };
}

function parsePgm(buffer) {
  const magic = readToken(buffer, 0);
  const width = readToken(buffer, magic.offset);
  const height = readToken(buffer, width.offset);
  const maxValue = readToken(buffer, height.offset);

  if (magic.value !== "P5" || Number(maxValue.value) !== 255) {
    throw new Error("Expected an 8-bit binary PGM image from ffmpeg.");
  }

  let pixelOffset = maxValue.offset;
  while (pixelOffset < buffer.length && [9, 10, 13, 32].includes(buffer[pixelOffset])) pixelOffset += 1;

  const pixelCount = Number(width.value) * Number(height.value);
  const pixels = buffer.subarray(pixelOffset, pixelOffset + pixelCount);

  if (pixels.length !== pixelCount) {
    throw new Error("PGM image data was incomplete.");
  }

  return { width: Number(width.value), height: Number(height.value), pixels };
}

async function samplePortrait(sourcePath, columns, rows) {
  const { stdout } = await execFileAsync(
    "python3",
    [
      resolve(scriptDirectory, "sample-portrait.py"),
      "--source", sourcePath,
      "--columns", columns.toString(),
      "--rows", rows.toString()
    ],
    { encoding: "buffer", maxBuffer: 4 * 1024 * 1024 }
  );

  return parsePgm(stdout);
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function createAsciiTspans({ pixels, width, height }, placement) {
  const characters = " .:-=+*#%@";
  const rows = [];

  for (let row = 0; row < height; row += 1) {
    let line = "";

    for (let column = 0; column < width; column += 1) {
      const index = row * width + column;
      const pixel = pixels[index];
      const left = pixels[row * width + Math.max(column - 1, 0)];
      const right = pixels[row * width + Math.min(column + 1, width - 1)];
      const above = pixels[Math.max(row - 1, 0) * width + column];
      const below = pixels[Math.min(row + 1, height - 1) * width + column];
      const darkness = (255 - pixel) / 255;
      const edge = (Math.abs(right - left) + Math.abs(below - above)) / 510;
      const ink = clamp(darkness * 1.02 + edge * 0.5 - 0.025, 0, 1);
      const characterIndex = Math.round(ink * (characters.length - 1));
      line += characters[characterIndex];
    }

    rows.push(
      `<tspan x="${placement.x}" y="${(placement.y + row * placement.lineHeight).toFixed(2)}" xml:space="preserve">${escapeXml(line)}</tspan>`
    );
  }

  return rows.join("\n");
}

function buildSystemLayer({ x, y, width, lineHeight, fontSize }, colors) {
  const clips = [];
  const rows = [];

  profileLines.forEach((line, index) => {
    if (line.type === "blank") return;

    const id = `system-line-${index}`;
    const lineY = y + index * lineHeight;
    const begin = (0.68 + index * 0.105).toFixed(2);

    clips.push(
      `<clipPath id="${id}"><rect x="${x - 3}" y="${(lineY - fontSize - 2).toFixed(2)}" width="0" height="${fontSize + 8}"><animate attributeName="width" from="0" to="${width}" dur="0.36s" begin="${begin}s" fill="freeze"/></rect></clipPath>`
    );

    if (line.type === "header") {
      rows.push(`<g clip-path="url(#${id})"><text x="${x}" y="${lineY}" class="system-head"><tspan fill="${colors.violet}">${escapeXml(line.value)}</tspan><tspan fill="${colors.muted}"> ------------------------------------------</tspan></text></g>`);
      return;
    }

    if (line.type === "section") {
      rows.push(`<g clip-path="url(#${id})"><text x="${x}" y="${lineY}" class="system-section" fill="${colors.green}">- ${escapeXml(line.value)} -----------------------------------</text></g>`);
      return;
    }

    if (line.type === "footer") {
      rows.push(`<g clip-path="url(#${id})"><text x="${x}" y="${lineY}" class="system-footer" fill="${colors.blue}">${escapeXml(line.value)}</text></g>`);
      return;
    }

    const dots = ".".repeat(Math.max(3, 14 - line.key.length));
    rows.push(
      `<g clip-path="url(#${id})"><text x="${x}" y="${lineY}" class="system-row"><tspan fill="${colors.muted}">. </tspan><tspan class="system-key" fill="${colors.cyan}">${escapeXml(line.key)}</tspan><tspan fill="${colors.muted}">: ${dots} </tspan><tspan fill="${colors.primary}">${escapeXml(line.value)}</tspan></text></g>`
    );
  });

  return { clips: clips.join("\n"), rows: rows.join("\n") };
}

function createHeroSvg(mode, size, portrait) {
  const colors = palettes[mode];
  const layout = layouts[size];
  const titlebar = layout.titlebar;
  const visual = layout.visualPanel;
  const info = layout.infoPanel;
  const clip = layout.portraitClip;
  const ascii = createAsciiTspans(portrait, layout.portrait);
  const ambientPortrait = buildAmbientPortraitLayer(layout, colors, size);
  const system = buildSystemLayer(layout.system, colors);
  const isDesktop = size === "desktop";
  const titleCenter = titlebar.x + titlebar.width / 2;
  const liveX = titlebar.x + titlebar.width - (isDesktop ? 138 : 94);
  const cursorY = layout.system.y + (profileLines.length - 1) * layout.system.lineHeight - 15;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${layout.width}" height="${layout.height}" viewBox="0 0 ${layout.width} ${layout.height}" role="img" aria-labelledby="title description">
<title id="title">Nabilkencana - Full-Stack Developer</title>
<desc id="description">An animated developer console with an ASCII portrait, tech stack, featured builds, and profile links.</desc>
<defs>
  <linearGradient id="background" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${colors.backgroundStart}"/><stop offset="1" stop-color="${colors.backgroundEnd}"/></linearGradient>
  <linearGradient id="ascii-signal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${colors.cyan}"><animate attributeName="stop-color" values="${colors.cyan};${colors.violet};${colors.blue};${colors.cyan}" dur="9s" repeatCount="indefinite"/></stop><stop offset="1" stop-color="${colors.violet}"><animate attributeName="stop-color" values="${colors.violet};${colors.blue};${colors.cyan};${colors.violet}" dur="9s" repeatCount="indefinite"/></stop></linearGradient>
  <linearGradient id="border" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${colors.violet}"/><stop offset="0.48" stop-color="${colors.cyan}"/><stop offset="1" stop-color="${colors.green}"/></linearGradient>
  <linearGradient id="scan" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${colors.cyan}" stop-opacity="0"/><stop offset="0.5" stop-color="${colors.cyan}" stop-opacity="0.46"/><stop offset="1" stop-color="${colors.violet}" stop-opacity="0"/></linearGradient>
  <radialGradient id="portrait-halo"><stop offset="0" stop-color="${colors.cyan}" stop-opacity="0.12"/><stop offset="0.48" stop-color="${colors.blue}" stop-opacity="0.055"/><stop offset="1" stop-color="${colors.violet}" stop-opacity="0"/></radialGradient>
  <pattern id="scanlines" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="${colors.cyan}" opacity="0.052"/></pattern>
  <pattern id="portrait-grid" width="44" height="44" patternUnits="userSpaceOnUse"><path d="M 44 0 H 0 V 44" fill="none" stroke="${colors.blue}" stroke-width="0.65" opacity="0.085"/><circle cx="0" cy="0" r="1.2" fill="${colors.cyan}" opacity="0.13"/></pattern>
  <clipPath id="portrait-clip"><rect x="${clip.x}" y="${clip.y}" width="${clip.width}" height="${clip.height}" rx="${clip.radius}"/></clipPath>
  <mask id="portrait-reveal"><rect x="${clip.x}" y="${clip.y}" width="${clip.width}" height="0" rx="${clip.radius}" fill="white"><animate attributeName="height" from="0" to="${clip.height}" dur="2.1s" begin="0.12s" fill="freeze"/></rect></mask>
  ${system.clips}
  <style>
    .mono { font-family: 'Courier New', Consolas, monospace; }
    .ascii { font-family: 'Courier New', Consolas, monospace; font-size: ${layout.portrait.fontSize}px; letter-spacing: -0.15px; fill: url(#ascii-signal); }
    .panel-title { font-family: 'Courier New', Consolas, monospace; font-size: ${isDesktop ? 11 : 12}px; letter-spacing: 2px; fill: ${colors.blue}; opacity: 0.78; }
    .terminal-label { font-family: 'Courier New', Consolas, monospace; font-size: ${isDesktop ? 12 : 11}px; letter-spacing: 0.5px; fill: ${colors.muted}; }
    .live-label { font-family: 'Courier New', Consolas, monospace; font-size: ${isDesktop ? 10 : 9}px; letter-spacing: 1px; fill: ${colors.red}; }
    .system-head { font-family: 'Courier New', Consolas, monospace; font-size: ${layout.system.fontSize + 2}px; font-weight: 700; }
    .system-section, .system-footer, .system-row { font-family: 'Courier New', Consolas, monospace; font-size: ${layout.system.fontSize}px; }
    .system-section, .system-key { font-weight: 700; }
    text, tspan { white-space: pre; }
  </style>
</defs>
<rect width="${layout.width}" height="${layout.height}" rx="${layout.outerRadius}" fill="url(#background)"/>
<rect width="${layout.width}" height="${layout.height}" rx="${layout.outerRadius}" fill="url(#scanlines)"/>
<rect x="${titlebar.x}" y="${titlebar.y}" width="${titlebar.width}" height="${titlebar.height}" rx="${titlebar.radius}" fill="${colors.panel}" fill-opacity="0.84"/>
<circle cx="${titlebar.x + 21}" cy="${titlebar.y + titlebar.height / 2}" r="5" fill="#EF4444"><animate attributeName="opacity" values="1;0.55;1" dur="4s" repeatCount="indefinite"/></circle>
<circle cx="${titlebar.x + 39}" cy="${titlebar.y + titlebar.height / 2}" r="5" fill="#F59E0B"><animate attributeName="opacity" values="1;0.55;1" dur="4s" begin="0.3s" repeatCount="indefinite"/></circle>
<circle cx="${titlebar.x + 57}" cy="${titlebar.y + titlebar.height / 2}" r="5" fill="${colors.green}"><animate attributeName="opacity" values="1;0.55;1" dur="4s" begin="0.6s" repeatCount="indefinite"/></circle>
<text x="${titleCenter}" y="${titlebar.y + titlebar.height / 2 + 5}" text-anchor="middle" class="terminal-label">nabilkencana@agentlab ~ % ./profile --live</text>
${isDesktop ? `<circle cx="${liveX}" cy="${titlebar.y + titlebar.height / 2}" r="4" fill="${colors.red}"><animate attributeName="opacity" values="1;0.15;1" dur="1.1s" repeatCount="indefinite"/></circle><text x="${liveX + 10}" y="${titlebar.y + titlebar.height / 2 + 4}" class="live-label">SCANNING</text>` : ""}
<rect x="${visual.x}" y="${visual.y}" width="${visual.width}" height="${visual.height}" rx="${visual.radius}" fill="${colors.panel}" fill-opacity="0.38" stroke="url(#border)" stroke-opacity="0.42"/>
<rect x="${info.x}" y="${info.y}" width="${info.width}" height="${info.height}" rx="${info.radius}" fill="${colors.panel}" fill-opacity="0.42" stroke="url(#border)" stroke-opacity="0.42"/>
<text x="${layout.visualTitle.x}" y="${layout.visualTitle.y}" class="panel-title">VISUAL.MAP / PORTRAIT.SIGNAL</text>
<text x="${layout.infoTitle.x}" y="${layout.infoTitle.y}" class="panel-title">SYSTEM.INFO / RESEARCH.BUILDER</text>
${ambientPortrait}
<g clip-path="url(#portrait-clip)" mask="url(#portrait-reveal)"><text class="ascii" fill="${colors.cyan}" font-family="'Courier New', Consolas, monospace" font-size="${layout.portrait.fontSize}px" letter-spacing="-0.15px">${ascii}</text></g>
${system.rows}
<rect x="${layout.system.x + 2}" y="${cursorY}" width="9" height="${layout.system.fontSize + 2}" fill="${colors.cyan}" opacity="0"><animate attributeName="opacity" values="0;0;1;0;1;0;1;0" keyTimes="0;0.03;0.06;0.32;0.5;0.68;0.84;1" dur="1.4s" begin="3.3s" repeatCount="indefinite"/></rect>
<text x="${layout.width / 2}" y="${layout.footerY}" text-anchor="middle" class="mono" font-size="10" letter-spacing="1.5" fill="${colors.muted}">FLUTTER / WEB / AI INTEGRATION</text>
<rect x="0" y="-70" width="${layout.width}" height="70" fill="url(#scan)" opacity="0.72" style="mix-blend-mode:${colors.scanBlend}"><animateTransform attributeName="transform" type="translate" from="0 -70" to="0 ${layout.height + 70}" dur="4.5s" repeatCount="indefinite"/></rect>
<rect x="3" y="3" width="${layout.width - 6}" height="${layout.height - 6}" rx="${layout.outerRadius - 2}" fill="none" stroke="url(#border)" stroke-width="2" opacity="0.76"><animate attributeName="opacity" values="0.5;0.94;0.5" dur="3.4s" repeatCount="indefinite"/></rect>
</svg>`;
}

async function main() {
  const sourcePath = getSourcePath();
  const desktopPortrait = await samplePortrait(sourcePath, layouts.desktop.portrait.columns, layouts.desktop.portrait.rows);
  const mobilePortrait = await samplePortrait(sourcePath, layouts.mobile.portrait.columns, layouts.mobile.portrait.rows);

  await mkdir(outputDirectory, { recursive: true });
  await Promise.all([
    writeFile(resolve(outputDirectory, "agent-console-v5-dark.svg"), createHeroSvg("dark", "desktop", desktopPortrait)),
    writeFile(resolve(outputDirectory, "agent-console-v5-light.svg"), createHeroSvg("light", "desktop", desktopPortrait)),
    writeFile(resolve(outputDirectory, "agent-console-v5-mobile-dark.svg"), createHeroSvg("dark", "mobile", mobilePortrait)),
    writeFile(resolve(outputDirectory, "agent-console-v5-mobile-light.svg"), createHeroSvg("light", "mobile", mobilePortrait))
  ]);

  console.log(`Generated refined hero assets from ${basename(sourcePath)}.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
