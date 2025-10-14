import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'
import prettier from 'eslint-config-prettier'
import prettierPlugin from 'eslint-plugin-prettier'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  {
    files: ['**/*.{ts,js}'], // aplica a .ts y .js
    ignores: ['dist'], // ignora carpeta compilada
    extends: [
<<<<<<< HEAD
      js.configs.recommended,        // reglas básicas de JS
      tseslint.configs.recommended,  // reglas de TS
      prettier, // Desactiva conflictos de formato
=======
      js.configs.recommended, // reglas básicas de JS
      tseslint.configs.recommended, // reglas de TS
      prettier, //Desactiva conflictos de formato
>>>>>>> dev
    ],
    plugins: {
      prettier: prettierPlugin,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node, // habilita variables globales de Node.js
    },
    rules: {
<<<<<<< HEAD
      "@typescript-eslint/no-unused-vars": "warn", // avisa si no usas una variable
      "no-console": "off", // en backend a veces sí usamos console.log
      "prettier/prettier": "warn", // 🔹 Advierte si no sigue formato de Prettier
    }
  }
=======
      '@typescript-eslint/no-unused-vars': 'warn', // avisa si no usas una variable
      'no-console': 'off', // en backend a veces sí usamos console.log
      'prettier/prettier': 'warn', // Advierte si no sigue formato de Prettier
    },
  },
>>>>>>> dev
])
