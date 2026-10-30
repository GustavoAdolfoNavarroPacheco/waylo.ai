#!/usr/bin/env node
// Checks commit messages against the project rules. It has no dependencies, so it runs anywhere Node does.
//
//   node scripts/check-commit-message.mjs --file <path>        one message, as the commit-msg hook passes it
//   node scripts/check-commit-message.mjs --range <base>..<head>  every commit in a range, as the pull request check does
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const TYPES = ["feat", "fix", "docs", "style", "refactor", "perf", "test", "build", "ci", "chore", "revert"];

const SUBJECT = new RegExp(`^(${TYPES.join("|")})(\\([a-z0-9-]+\\))?!?: \\S`);
const MAX_SUBJECT_LENGTH = 100;
// What git writes for a commit that will be squashed away. Fine on a local branch, never fine once it is pushed.
const TEMPORARY = /^(fixup|squash|amend)! /;

/**
 * The problems with a commit message: an empty list when it follows the rules.
 * Only the first line and the trailers are judged; a body is free text.
 * @param {string} message
 * @param {{ allowTemporary?: boolean }} [options]
 * @returns {string[]}
 */
export function checkMessage(message, options = {}) {
  const text = message.replace(/\r\n/g, "\n");
  const subject = text.split("\n").find((line) => line.trim() !== "")?.trim() ?? "";
  if (!subject) return ["the message is empty"];
  if (options.allowTemporary && TEMPORARY.test(subject)) return [];

  const problems = [];
  if (!SUBJECT.test(subject)) {
    problems.push(`start with a type, as in "feat: add login" or "fix(chat): keep the draft" (types: ${TYPES.join(", ")})`);
  }
  if (subject !== subject.toLowerCase()) problems.push("write the subject in lowercase only");
  if (/[^\x20-\x7e]/.test(subject)) problems.push("use plain ascii: no emoji, accents or other symbols");
  if (/(^|\s):[a-z0-9_+-]+:(\s|$)/.test(subject)) problems.push("leave out emoji codes such as :memo: or :sparkles:");
  if (subject.length > MAX_SUBJECT_LENGTH) problems.push(`keep the subject under ${MAX_SUBJECT_LENGTH} characters (it has ${subject.length})`);
  if (/^co-authored-by:.*(claude|anthropic)/im.test(text)) problems.push("remove the co-authored-by trailer for an ai assistant");
  return problems;
}

function report(title, problems) {
  return [`${title}`, ...problems.map((problem) => `  - ${problem}`)].join("\n");
}

function checkFile(file) {
  const raw = readFileSync(file, "utf8");
  // A merge that git writes itself ("Merge branch ...") is not something the person typed, so it passes.
  const gitDir = execFileSync("git", ["rev-parse", "--git-dir"], { encoding: "utf8" }).trim();
  if (existsSync(path.join(gitDir, "MERGE_HEAD"))) return 0;

  const message = raw
    .split("\n")
    .filter((line) => !line.startsWith("#"))
    .join("\n");
  const problems = checkMessage(message, { allowTemporary: true });
  if (problems.length === 0) return 0;
  console.error(report("commit rejected: the message breaks the project rules", problems));
  console.error('\nexample: "fix: keep the cedula when linking the ips". Fix the message and commit again.');
  return 1;
}

function checkRange(range) {
  // Merges are left out on purpose: the ones github writes cannot follow the rules, and they carry no work of their own.
  const log = execFileSync("git", ["log", "--no-merges", "--format=%H%x1f%B%x1e", range], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  const failures = [];
  for (const entry of log.split("\x1e")) {
    const [hash, message] = entry.trim().split("\x1f");
    if (!hash) continue;
    const problems = checkMessage(message ?? "");
    if (problems.length > 0) failures.push(report(`${hash.slice(0, 7)}: ${(message ?? "").split("\n")[0]}`, problems));
  }
  if (failures.length === 0) return 0;
  console.error(`${failures.length} commit message(s) break the project rules:\n`);
  console.error(failures.join("\n\n"));
  console.error("\nrewrite them with `git rebase -i` (reword) and push again with --force-with-lease.");
  return 1;
}

function main(argv) {
  const [mode, value] = argv;
  if (mode === "--file" && value) return checkFile(value);
  if (mode === "--range" && value) return checkRange(value);
  console.error("usage: check-commit-message.mjs --file <path> | --range <base>..<head>");
  return 2;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main(process.argv.slice(2));
}
