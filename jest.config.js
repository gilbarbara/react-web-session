module.exports = {
  transform: {
    '.*': 'babel-jest',
  },
  moduleFileExtensions: [
    'js',
    'jsx',
    'json',
  ],
  moduleDirectories: [
    'node_modules',
    'src',
    './',
  ],
  setupFiles: [
    '<rootDir>/test/__setup__/setupFiles.js'
  ],
  testEnvironment: 'jest-environment-jsdom-global',
  testEnvironmentOptions: {
    resources: 'usable',
  },
  testRegex: '/test/.*?\\.(test|spec)\\.js$',
  testURL: 'http://localhost:3000',
  collectCoverage: false,
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
  },
  verbose: true,
};
