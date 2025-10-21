import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'
import prettier from 'eslint-config-prettier'
import prettierPlugin from 'eslint-plugin-prettier'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  // 1. OBJETO DEDICADO PARA EXCLUSIONES GLOBALES
  {
    ignores: [
      'dist/**',
      'src/generated/**', // Ignora el código de Prisma
      'node_modules/**',
      '.env',
    ],
  },

  // 2. TU CONFIGURACIÓN DE REGLAS (Ahora sin la propiedad 'ignores')
  {
    files: ['**/*.{ts,js}'], // aplica a .ts y .js

    // ¡QUITAMOS la propiedad ignores de este objeto!

    extends: [js.configs.recommended, tseslint.configs.recommended, prettier],
    plugins: {
      prettier: prettierPlugin,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "warn", // avisa si no usas una variable
      "no-console": "off", // en backend a veces sí usamos console.log
      "prettier/prettier": "warn", // 🔹 Advierte si no sigue formato de Prettier
    }
  }
])
