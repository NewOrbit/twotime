import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import NewOrbitEslintConfig from "eslint-config-neworbit";
import oxlint from "eslint-plugin-oxlint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default [
    {
        ignores: ["**/node_modules", "dist"],
    },
    ...compat.extends("eslint:recommended", "plugin:@typescript-eslint/recommended"),
    ...NewOrbitEslintConfig,
    {
        plugins: {
            "@typescript-eslint": typescriptEslint,
        },
        languageOptions: {
            parser: tsParser,
            ecmaVersion: 2024,
            sourceType: "module",
        },
        rules: {
            // Erasable enum replacements deliberately merge a `const` and a `type` of the
            // same name, which live in separate declaration spaces. TypeScript itself
            // reports genuine redeclarations (TS2451), so this rule is redundant here.
            "@typescript-eslint/no-redeclare": "off",
        },
    },
    // Last so it wins: turns off every ESLint rule that oxlint already
    // enforces (oxlint runs first in the lint script).
    ...oxlint.buildFromOxlintConfigFile("./.oxlintrc.json"),
];
