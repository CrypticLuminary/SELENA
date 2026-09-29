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

  if (text.includes("@/data/patterns")) {
    violations.push(`${rel}: synthetic aggregate pattern data is forbidden after Phase 8.`);
  }

  if (text.includes("@/lib/mock-api")) {
    violations.push(`${rel}: the retired mock API boundary must not be reintroduced.`);
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
  ["crossGroupSize: 20", "two-dimension public cells must use the stronger minimum"],
  ["maxDimensions: 2", "public analytics must remain capped at two dimensions"],
]) {
  if (!privacy.includes(invariant[0])) {
    violations.push(`src/lib/privacy.ts: ${invariant[1]}.`);
  }
}

const backendAnalyticsPolicy = await readFile(
  join(root, "backend/analytics/policy.py"),
  "utf8",
);
const backendSubmissionPolicy = await readFile(
  join(root, "backend/submissions/policy.py"),
  "utf8",
);

function requiredMatch(text, regex, description) {
  const match = text.match(regex);
  if (!match) {
    violations.push(`privacy policy sync: could not read ${description}.`);
    return null;
  }
  return match[1];
}

const policyPairs = [
  ["minGroupSize", "MIN_GROUP_SIZE"],
  ["sensitiveGroupSize", "SENSITIVE_GROUP_SIZE"],
  ["crossGroupSize", "CROSS_GROUP_SIZE"],
  ["maxDimensions", "MAX_PUBLIC_DIMENSIONS"],
];

for (const [frontendName, backendName] of policyPairs) {
  const frontendValue = requiredMatch(
    privacy,
    new RegExp(`\\b${frontendName}:\\s*(\\d+)`),
    `frontend ${frontendName}`,
  );
  const backendValue = requiredMatch(
    backendAnalyticsPolicy,
    new RegExp(`^${backendName}\\s*=\\s*(\\d+)`, "m"),
    `backend ${backendName}`,
  );
  if (
    frontendValue !== null &&
    backendValue !== null &&
    frontendValue !== backendValue
  ) {
    violations.push(
      `privacy policy sync: frontend ${frontendName}=${frontendValue} does not match backend ${backendName}=${backendValue}.`,
    );
  }
}

const frontendPolicyVersion = requiredMatch(
  privacy,
  /PRIVACY_POLICY_VERSION\s*=\s*"([^"]+)"/,
  "frontend privacy policy version",
);
const backendPolicyVersion = requiredMatch(
  backendSubmissionPolicy,
  /PRIVACY_POLICY_VERSION\s*=\s*"([^"]+)"/,
  "backend privacy policy version",
);
if (
  frontendPolicyVersion !== null &&
  backendPolicyVersion !== null &&
  frontendPolicyVersion !== backendPolicyVersion
) {
  violations.push(
    `privacy policy sync: frontend version ${frontendPolicyVersion} does not match backend version ${backendPolicyVersion}.`,
  );
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

