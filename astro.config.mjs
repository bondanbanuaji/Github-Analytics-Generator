// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://github-analytics-one.vercel.app", // User to update if needed
  output: "server",
  adapter: vercel(),
  integrations: [react(), sitemap()],
});