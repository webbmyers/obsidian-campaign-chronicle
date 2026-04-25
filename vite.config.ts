import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";
import builtins from "builtin-modules";
import path from "path";

// Vite config for Obsidian plugin.
// Outputs main.js and styles.css to the project root, which is what
// Obsidian expects.  All external Obsidian/Electron modules are kept
// as externals so they are not bundled.
export default defineConfig(({ mode }) => ({
  plugins: [svelte()],
  build: {
    lib: {
      entry: "src/main.ts",
      formats: ["cjs"],
      fileName: () => "main.js",
    },
    outDir: ".",       // output straight to project root
    emptyOutDir: false, // never wipe root-level files like manifest.json
    sourcemap: mode === "development" ? "inline" : false,
    minify: mode === "production",
    rollupOptions: {
      external: [
        "obsidian",
        "electron",
        "@codemirror/autocomplete",
        "@codemirror/collab",
        "@codemirror/commands",
        "@codemirror/language",
        "@codemirror/lint",
        "@codemirror/search",
        "@codemirror/state",
        "@codemirror/view",
        "@lezer/common",
        "@lezer/highlight",
        "@lezer/lr",
        ...builtins,
      ],
      output: {
        // Obsidian requires the CSS file to be named styles.css at the root.
        assetFileNames: (info) =>
          info.name?.endsWith(".css") ? "styles.css" : (info.name ?? "asset"),
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
}));
