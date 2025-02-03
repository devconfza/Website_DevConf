import typescriptEslint from "@typescript-eslint/eslint-plugin"
import globals from "globals"
import tsParser from "@typescript-eslint/parser"
import path from "node:path"
import { fileURLToPath } from "node:url"
import js from "@eslint/js"
import { FlatCompat } from "@eslint/eslintrc"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
})

export default [{
    ignores: ["scripts/devconf.js", "_site/scripts/devconf.js"],
    plugins: {
        "@typescript-eslint": typescriptEslint,
    },

    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.node,
        },

        parser: tsParser,
    },

    rules: {
        "import/no-unresolved": 0,
        indent: ["error", 4],
        semi: ["error", "never"],
        "max-len": ["error", 200],
        "no-lonely-if": "off",
        "default-case": "off",
        "no-param-reassign": "off",
        "no-use-before-define": "off",
        "no-plusplus": "off",
    },
}]