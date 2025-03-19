import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import NewOrbitEslintConfig from "eslint-config-neworbit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default [
  {
    ignores: ["**/node_modules", "**/bin", "**/bin-test", "node_modules/*"],
  },
  ...compat.extends("eslint:recommended", "plugin:@typescript-eslint/recommended"),
  ...NewOrbitEslintConfig,
  {
    plugins: {
        "@typescript-eslint": typescriptEslint,
    },
    languageOptions: {
        parser: tsParser,
        ecmaVersion: 2020,
        sourceType: "module",
    }
  }
];
