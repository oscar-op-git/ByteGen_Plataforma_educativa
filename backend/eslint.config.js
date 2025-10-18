import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'
import prettier from 'eslint-config-prettier'
import prettierPlugin from 'eslint-plugin-prettier'
import { defineConfig } from 'eslint/config'

export default defineConfig([
    // 1. OBJETO DEDICADO PARA EXCLUSIONES GLOBALES (¡Va primero!)
    {
        ignores: [
            'dist/**', 
            'src/generated/**', // Ignora el código de Prisma
            'node_modules/**', 
            '.env' 
        ]
    },

    // 2. TU CONFIGURACIÓN DE REGLAS (Ahora sin la propiedad 'ignores')
    {
        files: ['**/*.{ts,js}'], // aplica a .ts y .js
        
        // ¡QUITAMOS la propiedad ignores de este objeto!
        
        extends: [
          js.configs.recommended, 
          tseslint.configs.recommended,
          prettier,
        ],
        plugins: {
          prettier: prettierPlugin,
        },
        languageOptions: {
          ecmaVersion: 2020,
          globals: globals.node,
        },
        rules: {
          '@typescript-eslint/no-unused-vars': 'warn',
          'no-console': 'off',
          'prettier/prettier': 'warn',
        },
    },
])