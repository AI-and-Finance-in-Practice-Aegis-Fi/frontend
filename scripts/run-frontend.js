const { readdirSync, readFileSync } = require("fs");
const { join } = require("path");
const { spawn } = require("child_process");

const [, , scriptName, ...scriptArgs] = process.argv;

if (!scriptName) {
  console.error("Usage: node scripts/run-frontend.js <script> [args...]");
  process.exit(1);
}

const root = process.cwd();
const appDir = readdirSync(root, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .find((dirName) => {
    try {
      const packageJson = JSON.parse(
        readFileSync(join(root, dirName, "package.json"), "utf8"),
      );

      return packageJson.name === "aegis-fi-frontend";
    } catch {
      return false;
    }
  });

if (!appDir) {
  console.error("Could not find the aegis-fi-frontend app directory.");
  process.exit(1);
}

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const child = spawn(
  npmCommand,
  ["run", scriptName, ...scriptArgs],
  {
    cwd: join(root, appDir),
    stdio: "inherit",
    shell: false,
  },
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
