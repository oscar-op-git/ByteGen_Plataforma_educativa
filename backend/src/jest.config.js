
export default {
    displayName: "backend",
    rootDir: "./",
    preset: "ts-jest/presets/default-esm", // preset ESM
        testEnvironment: "node",
        extensionsToTreatAsEsm: [".ts"],
        roots: ["<rootDir>/src"],
        moduleFileExtensions: ["ts", "js", "json", "node"]
  };