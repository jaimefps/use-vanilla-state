import { defineConfig } from "cypress"

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/integration/**/*.spec.ts",
    supportFile: "cypress/support/index.js",
  },
})
