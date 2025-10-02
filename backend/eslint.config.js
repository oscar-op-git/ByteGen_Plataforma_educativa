import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  {
    files: ['**/*.{ts,js}'], // aplica a .ts y .js
    ignores: ['dist'], // ignora carpeta compilada
    extends: [
      js.configs.recommended,        // reglas básicas de JS
      tseslint.configs.recommended,  // reglas de TS
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node, // habilita variables globales de Node.js
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "warn", // avisa si no usas una variable
      "no-console": "off", // en backend a veces sí usamos console.log
    }
  }
])
