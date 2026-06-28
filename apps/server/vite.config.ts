import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: "src/index.ts",
    platform: "node",
    format: "esm",
    target: "node26",
    outDir: "dist",
    sourcemap: true,
    // We don't need to generate dts files for the server package, as it is not intended to be consumed by other packages.
    dts: false,
    deps: {
      alwaysBundle: [/.+/], // override library default — bundle everything
      neverBundle: [
        // Carve out native addons, They can't be bundled (This should always contain native modules that are used in the server package e.g argon2, bcrypt, etc.)
      ],
      onlyBundle: false,
    },
  },
});
