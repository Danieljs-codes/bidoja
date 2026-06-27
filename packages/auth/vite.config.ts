import { defineConfig } from "vite-plus";

export default defineConfig({
  lint: {
    plugins: ["eslint", "oxc", "react", "unicorn", "typescript"],
    categories: {
      correctness: "warn",
      suspicious: "warn",
      perf: "warn",
    },
    options: {
      typeAware: false,
      typeCheck: false,
    },
  },
  fmt: {
    sortImports: {
      newlinesBetween: false,
      customGroups: [
        {
          groupName: "effect",
          selector: "external",
          elementNamePattern: ["effect", "effect/**"],
        },
      ],
      groups: [
        "builtin",
        "effect",
        { newlinesBetween: true },
        "external",
        ["internal", "subpath"],
        ["parent", "sibling", "index"],
        "style",
      ],
    },
    sortTailwindcss: true,
    ignorePatterns: ["**/_generated/**", "**/dist/**", "**/node_modules/**"],
  },
});
