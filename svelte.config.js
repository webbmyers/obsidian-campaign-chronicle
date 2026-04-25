import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

export default {
  // Use Vite's built-in preprocessor so TypeScript inside .svelte files works.
  preprocess: vitePreprocess(),
};
