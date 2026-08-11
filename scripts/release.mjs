#!/usr/bin/env node
/**
 * Cut a GitHub Release from package.json version.
 * Usage:
 *   npm run release
 *   npm run release -- --dry-run
 *   npm run release -- --notes "Changelog bullets"
 *
 * Requires: git, gh (authenticated), clean-enough working tree for tagging.
 * CI builds Win/macOS/Linux when the release is published.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { homedir } from "node:os";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dryRun = process.argv.includes("--dry-run");
const notesIdx = process.argv.indexOf("--notes");
const notesArg =
  notesIdx >= 0 && process.argv[notesIdx + 1]
    ? process.argv[notesIdx + 1]
    : null;

/** Resolve `gh` even when npm's PATH omits "GitHub CLI" (common on Windows). */
function resolveGh() {
  const candidates = [];
  if (process.platform === "win32") {
    const pf = process.env["ProgramFiles"] || "C:\\Program Files";
    const pf86 = process.env["ProgramFiles(x86)"] || "C:\\Program Files (x86)";
    const local =
      process.env.LOCALAPPDATA || resolve(homedir(), "AppData", "Local");
    candidates.push(
      resolve(pf, "GitHub CLI", "gh.exe"),
      resolve(pf86, "GitHub CLI", "gh.exe"),
      resolve(local, "Programs", "GitHub CLI", "gh.exe"),
    );
  } else {
    candidates.push("/opt/homebrew/bin/gh", "/usr/local/bin/gh", "/usr/bin/gh");
  }
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  try {
    const which = process.platform === "win32" ? "where.exe gh" : "command -v gh";
    const found = execSync(which, { encoding: "utf8" }).trim().split(/\r?\n/)[0];
    if (found && existsSync(found)) return found;
  } catch {
    /* not on PATH */
  }
  return null;
}

const ghBin = resolveGh();

function readJson(rel) {
  return JSON.parse(readFileSync(resolve(root, rel), "utf8"));
}

function sh(cmd) {
  console.log(`$ ${cmd}`);
  if (dryRun) return "";
  return execSync(cmd, {
    cwd: root,
    stdio: "inherit",
    encoding: "utf8",
    shell: true,
  });
}

function shCapture(cmd) {
  return execSync(cmd, {
    cwd: root,
    encoding: "utf8",
    shell: true,
  }).trim();
}

function gh(args) {
  if (!ghBin) {
    console.error(`
No se encontró GitHub CLI (gh).

Instálalo y reinicia la terminal:
  winget install --id GitHub.cli -e
  # o: https://cli.github.com/

Luego autentica una vez:
  gh auth login
`);
    process.exit(1);
  }
  const quoted =
    process.platform === "win32" && ghBin.includes(" ")
      ? `"${ghBin}"`
      : ghBin;
  return `${quoted} ${args}`;
}

const pkg = readJson("package.json");
const version = String(pkg.version || "").trim();
if (!/^\d+\.\d+\.\d+/.test(version)) {
  console.error(`Invalid package.json version: ${version}`);
  process.exit(1);
}

const tag = `v${version}`;
const tauriVersion = readJson("src-tauri/tauri.conf.json").version;
const cargoToml = readFileSync(resolve(root, "src-tauri/Cargo.toml"), "utf8");
const cargoMatch = cargoToml.match(/^version\s*=\s*"([^"]+)"/m);
const cargoVersion = cargoMatch?.[1];

if (tauriVersion !== version || cargoVersion !== version) {
  console.error("Version mismatch — bump all three before releasing:");
  console.error(`  package.json:        ${version}`);
  console.error(`  tauri.conf.json:     ${tauriVersion}`);
  console.error(`  Cargo.toml:          ${cargoVersion}`);
  process.exit(1);
}

console.log(`Release target: Faro ${version} (tag ${tag})`);
console.log(`Using gh: ${ghBin}`);
if (dryRun) console.log("(dry-run — no git/gh changes)\n");

try {
  shCapture(gh("--version"));
} catch (e) {
  console.error("No se pudo ejecutar gh. ¿Está instalado?");
  console.error(String(e));
  process.exit(1);
}

const existingTag = (() => {
  try {
    return shCapture(`git rev-parse -q --verify "refs/tags/${tag}"`);
  } catch {
    return "";
  }
})();

if (existingTag) {
  console.error(`Tag ${tag} already exists locally.`);
  process.exit(1);
}

const title = `Faro ${version}`;
const notes =
  notesArg ??
  `Faro ${version}\n\nInstallers (Windows / macOS / Linux) are built by CI — do not use Source code zip.`;

sh(`git tag -a ${tag} -m ${JSON.stringify(title)}`);
sh(`git push origin ${tag}`);
sh(
  gh(
    `release create ${tag} --title ${JSON.stringify(title)} --notes ${JSON.stringify(notes)} --latest`,
  ),
);

console.log(`\nPublished ${tag}. Watch Actions: Release multi-platform packages.`);
console.log("Guide: docs/RELEASE.md");
