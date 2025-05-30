import { createDefaultPreset } from "ts-jest";

const tsJestTransformCfg = createDefaultPreset().transform;

export default {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
    "^.+\\.m?[jt]sx?$": ["ts-jest", { tsconfig: "./tsconfig.test.json" }],
  },
  collectCoverage: true,
  collectCoverageFrom: [
    "src/agents/**/*.{ts,js}",
    "src/engine/**/*.{ts,js}",
    "src/tasks/**/*.{ts,js}",
    "src/helpers/**/*.{ts,js}",
    "src/agentTraining/**/*.{ts,js}",
    "src/tools/base/**/*.{ts,js}",
    "src/tools/toolWorker/**/*.{ts,js}",
    "!**/*.test.{ts,js}",
    "!**/index.{ts,js}",
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transformIgnorePatterns: ["/node_modules/(?!chalk)/"],
};
