import { defineRailway, github, preserve, project, service } from "railway/iac";

// Migrated from railway.toml (Config as Code stops working 2026-12-01).
// This repository manages only its own service. Every railway.toml setting is
// carried over explicitly; `railway config migrate` left builder/restart policy as comments.
// See https://docs.railway.com/infrastructure-as-code#multi-repo-projects
export const partial = "Countist-Marketing";

export default defineRailway(() => {
  const svc = service("countist-marketing", {
    source: github("shanetrost/Countist-Marketing", { branch: "master", checkSuites: false }),
    build: {
      builder: "NIXPACKS",
      buildCommand: "npx astro build",
    },
    deploy: {
      startCommand: "node server.js",
      healthcheckPath: "/",
      healthcheckTimeout: 30,
      restartPolicyType: "ON_FAILURE",
      restartPolicyMaxRetries: 3,
    },
    // Values live in Railway; preserve() keeps them out of the repo and unchanged.
    env: {
      DATABASE_URL: preserve(),
      VITE_CLERK_PUBLISHABLE_KEY: preserve(),
    },
  });
  return project("Countist Marketing Page", {
    resources: [svc],
  });
});
