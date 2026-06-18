module.exports = {
  preset: "jest-expo",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.tsx",
  ],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/expo-modules-core/",
  ],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
};
