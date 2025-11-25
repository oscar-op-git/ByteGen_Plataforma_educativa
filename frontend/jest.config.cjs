/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testMatch: ['**/?(*.)+(test).(ts|tsx)'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  moduleNameMapper: {
    // Para que "./algo.js" resuelva al .ts/.tsx en Vite+TS
    '^(\\.{1,2}/.*)\\.js$': '$1',

    // Si usas imports tipo "@/components/..."
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  globals: {
    'ts-jest': {
      diagnostics: {
        ignoreCodes: [151002],
      },
    },
  },
};
