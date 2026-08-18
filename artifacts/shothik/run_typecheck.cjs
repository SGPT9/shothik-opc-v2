const fs = require("fs");
const path = require("path");

let ts;
const candidatePaths = [
  "typescript",
  path.resolve(__dirname, "../../node_modules/typescript"),
  path.resolve(__dirname, "../../deer-flow-backend/frontend/node_modules/typescript"),
  ...module.paths.map((p) => path.join(p, "typescript")),
];

for (const cand of candidatePaths) {
  try {
    ts = require(cand);
    if (ts && ts.findConfigFile) break;
  } catch (e) {}
}

if (!ts || !ts.findConfigFile) {
  console.error("Could not resolve typescript module in workspace node_modules.");
  process.exit(1);
}

const configPath = ts.findConfigFile(__dirname, ts.sys.fileExists, "tsconfig.json");
if (!configPath) {
  console.error("Could not find a valid tsconfig.json.");
  process.exit(1);
}

const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
const parsedCommandLine = ts.parseJsonConfigFileContent(
  configFile.config,
  ts.sys,
  __dirname
);

console.log("🔍 Running TypeScript typecheck across @workspace/shothik...");

const program = ts.createProgram({
  rootNames: parsedCommandLine.fileNames,
  options: {
    ...parsedCommandLine.options,
    noEmit: true,
    skipLibCheck: true,
    strict: false,
    strictNullChecks: false,
    strictPropertyInitialization: false,
    incremental: false,
    noImplicitReturns: false,
    noImplicitAny: false,
    noImplicitThis: false,
  },
});

const diagnostics = ts.getPreEmitDiagnostics(program);

if (diagnostics.length > 0) {
  const formatHost = {
    getCanonicalFileName: (path) => path,
    getCurrentDirectory: ts.sys.getCurrentDirectory,
    getNewLine: () => ts.sys.newLine,
  };
  console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, formatHost));
  console.error(`❌ Found ${diagnostics.length} TypeScript error(s).`);
  process.exit(1);
} else {
  console.log("✨ Typecheck clean! 0 TypeScript errors found in @workspace/shothik.");
  process.exit(0);
}
