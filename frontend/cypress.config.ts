import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    specPattern: "cypress/e2e/**/*.cy.{ts,tsx}",
    supportFile: "cypress/support/e2e.ts",
    screenshotsFolder: "cypress/screenshots",
    videosFolder: "cypress/videos",
    viewportWidth: 1280,
    viewportHeight: 720,
  },

  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
  },
});
