import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templateRoot = path.resolve(__dirname, "..");

const args = process.argv.slice(2);
const parsed = parseArgs(args);

if (parsed.help || !parsed.name) {
  printUsage();
  process.exit(parsed.help ? 0 : 1);
}

const displayName = parsed.name.trim();
const packageName = toKebabCase(displayName);
const targetDir = parsed.target
  ? path.resolve(parsed.target)
  : path.join(process.cwd(), displayName);

if (isSubpath(templateRoot, targetDir)) {
  console.error(
    "Target directory must be outside the template folder to avoid recursive copies."
  );
  process.exit(1);
}

const existing = await getDirState(targetDir);
if (existing.exists && existing.hasEntries && !parsed.force) {
  console.error(
    `Target directory already exists and is not empty: ${targetDir}\n` +
      "Use --force to continue or choose a different target."
  );
  process.exit(1);
}

await fs.mkdir(targetDir, { recursive: true });
await copyTemplate(templateRoot, targetDir);
await updatePackageJson(targetDir, packageName);
await updatePackageLock(targetDir, packageName);
await updateReadme(targetDir, displayName);
await updateHomeHeading(targetDir, displayName);

console.log("Project created:");
console.log(`- Name: ${displayName}`);
console.log(`- Package: ${packageName}`);
console.log(`- Path: ${targetDir}`);
console.log("Next:");
console.log(`cd "${targetDir}"`);
console.log("npm install");

function parseArgs(input) {
  const result = { name: "", target: "", force: false, help: false };
  for (let i = 0; i < input.length; i += 1) {
    const arg = input[i];
    if (arg === "--help" || arg === "-h") {
      result.help = true;
      continue;
    }
    if (arg === "--force") {
      result.force = true;
      continue;
    }
    if (arg.startsWith("--target=")) {
      result.target = arg.slice("--target=".length);
      continue;
    }
    if (arg === "--target") {
      result.target = input[i + 1] || "";
      i += 1;
      continue;
    }
    if (!result.name) {
      result.name = arg;
      continue;
    }
    if (!result.target) {
      result.target = arg;
    }
  }
  return result;
}

function printUsage() {
  console.log("Usage:");
  console.log("node scripts/init_project.js <project-name> [target-dir]");
  console.log("");
  console.log("Options:");
  console.log("  --target <dir>  Create project at the given path");
  console.log("  --force         Allow creating into a non-empty folder");
  console.log("  -h, --help      Show this help");
}

function toKebabCase(input) {
  const normalized = input
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return normalized || "my-app";
}

async function getDirState(dir) {
  try {
    const entries = await fs.readdir(dir);
    return { exists: true, hasEntries: entries.length > 0 };
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return { exists: false, hasEntries: false };
    }
    throw error;
  }
}

async function copyTemplate(fromDir, toDir) {
  const ignoreNames = new Set([
    ".git",
    "node_modules",
    ".env",
    "dist",
    "build",
  ]);

  await fs.cp(fromDir, toDir, {
    recursive: true,
    filter: (src) => {
      const rel = path.relative(fromDir, src);
      if (!rel) {
        return true;
      }
      const parts = rel.split(path.sep);
      return !parts.some((part) => ignoreNames.has(part));
    },
  });
}

async function updatePackageJson(targetDir, packageName) {
  const pkgPath = path.join(targetDir, "package.json");
  const pkg = await readJson(pkgPath);
  if (!pkg) {
    return;
  }
  pkg.name = packageName;
  await writeJson(pkgPath, pkg);
}

async function updatePackageLock(targetDir, packageName) {
  const lockPath = path.join(targetDir, "package-lock.json");
  const lock = await readJson(lockPath);
  if (!lock) {
    return;
  }
  lock.name = packageName;
  if (lock.packages && lock.packages[""]) {
    lock.packages[""].name = packageName;
  }
  await writeJson(lockPath, lock);
}

async function updateReadme(targetDir, displayName) {
  const readmePath = path.join(targetDir, "README.md");
  const content = await readText(readmePath);
  if (!content) {
    return;
  }
  const updated = content.replace(/^#\s+.+/m, `# ${displayName}`);
  await fs.writeFile(readmePath, updated, "utf8");
}

async function updateHomeHeading(targetDir, displayName) {
  const homePath = path.join(targetDir, "src", "js", "Home.js");
  const content = await readText(homePath);
  if (!content) {
    return;
  }
  const updated = content.replace(
    /My Default ReactJS App/g,
    displayName
  );
  await fs.writeFile(homePath, updated, "utf8");
}

async function readJson(filePath) {
  try {
    const content = await fs.readFile(filePath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

async function readText(filePath) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return "";
    }
    throw error;
  }
}

async function writeJson(filePath, data) {
  const serialized = JSON.stringify(data, null, 2) + "\n";
  await fs.writeFile(filePath, serialized, "utf8");
}

function isSubpath(parent, candidate) {
  const rel = path.relative(parent, candidate);
  return rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel));
}
