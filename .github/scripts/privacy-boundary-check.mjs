import { readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";

const root = process.cwd();
const src = join(root, "src");
const violations = [];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) files.push(path);
  }
  return files;
}

for (const file of await walk(src)) {
  const text = await readFile(file, "utf8");
  const rel = relative(root, file).replaceAll("\\", "/");

  if (text.includes("dangerouslySetInnerHTML")) {
    violations.push(`${rel}: dangerouslySetInnerHTML is forbidden without an explicit security review.`);
  }

  if (text.includes("@/data/stories")) {
    violations.push(`${rel}: synthetic public story data is forbidden after Phase 7.`);
  }

  if (text.includes("@/data/patterns") && rel !== "src/lib/mock-api.ts") {
    violations.push(`${rel}: temporary pattern fixtures must stay behind src/lib/mock-api.ts.`);
  }

  if (text.includes("localStorage") && rel.startsWith("src/")) {
    violations.push(`${rel}: localStorage is not allowed for SELENA sensitive flows.`);
  }
}

const schema = await readFile(join(src, "lib/submission-schema.ts"), "utf8");
if (!/consentStatistics:\s*false/.test(schema)) {
  violations.push("src/lib/submission-schema.ts: statistics consent must remain opt-in by default.");
}

const privacy = await readFile(join(src, "lib/privacy.ts"), "utf8");
for (const invariant of [
  ["exactCountsPublic: false", "exact public counts must stay disabled"],
  ["geographicBreakdown: false", "geographic breakdown must stay disabled"],
  ["maxDimensions: 2", "public analytics must remain capped at two dimensions"],
]) {
  if (!privacy.includes(invariant[0])) {
    violations.push(`src/lib/privacy.ts: ${invariant[1]}.`);
  }
}


const apiClient = await readFile(join(src, "lib/api.ts"), "utf8");
if (apiClient.includes("NEXT_PUBLIC_")) {
  violations.push("src/lib/api.ts: backend routing must use server-only environment variables.");
}

if (violations.length) {
  console.error("SELENA privacy-boundary check failed:\n");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log("SELENA privacy-boundary check passed.");

