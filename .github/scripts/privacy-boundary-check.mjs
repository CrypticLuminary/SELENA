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

  const importsSensitiveMockData =
    text.includes("@/data/stories") || text.includes("@/data/patterns");
  if (importsSensitiveMockData && rel !== "src/lib/mock-api.ts") {
    violations.push(`${rel}: story/pattern data must be accessed through src/lib/mock-api.ts.`);
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

if (violations.length) {
  console.error("SELENA privacy-boundary check failed:\n");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log("SELENA privacy-boundary check passed.");
