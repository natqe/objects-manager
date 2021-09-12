/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: [`test`],
  moduleNameMapper: {
    "^lodash-es$": "lodash"
  },
  collectCoverage: true,
}