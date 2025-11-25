/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testMatch: ['**/?(*.)+(test).(ts|tsx)'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],

  // ✅ Nueva forma recomendada de configurar ts-jest (sin usar "globals")
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: {
          // Aquí le decimos a TypeScript cómo compilar los tests
          jsx: 'react-jsx',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
        },
        diagnostics: {
          ignoreCodes: [151002],
        },
      },
    ],
  },
};
