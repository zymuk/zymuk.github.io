// Reuse the Create React App Jest configuration (transforms, jsdom,
// src/setupTests.js, package.json-based overrides) but scan tests from the
// `test/` directory instead of `src/`.
process.env.BABEL_ENV = "test";
process.env.NODE_ENV = "test";
process.env.PUBLIC_URL = "";

require("react-scripts/config/env");

const path = require("path");
const createJestConfig = require("react-scripts/scripts/utils/createJestConfig");

const config = createJestConfig(
  (relativePath) => path.resolve("node_modules/react-scripts", relativePath),
  __dirname,
  false
);

// Tests live in a top-level `test/` directory, parallel to `src/`.
config.roots = ["<rootDir>/test"];
config.testMatch = [
  "<rootDir>/test/**/__tests__/**/*.{js,jsx,ts,tsx}",
  "<rootDir>/test/**/*.{spec,test}.{js,jsx,ts,tsx}",
];

// Jest 27 cannot resolve package "exports" subpaths. react-router-dom v7
// imports `react-router/dom` at load time, so map it to the CJS build.
config.moduleNameMapper = {
  ...config.moduleNameMapper,
  "^react-router/dom$":
    "<rootDir>/node_modules/react-router/dist/development/dom-export.js",
};

module.exports = config;
