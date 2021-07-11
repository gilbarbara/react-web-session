module.exports = {
  collectCoverage: false,
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  globals: {
    'ts-jest': {
      tsconfig: 'test/tsconfig.json',
    },
  },
  moduleDirectories: ['node_modules', 'src', './'],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  preset: 'ts-jest',
  resetMocks: false,
  setupFiles: ['<rootDir>/test/__setup__/setupFiles.ts'],
  setupFilesAfterEnv: ['jest-location-mock'],
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    resources: 'usable',
  },
  testRegex: '/test/.*?\\.(test|spec)\\.tsx?$',
  testURL: 'http://localhost:3000',
  verbose: false,
};
