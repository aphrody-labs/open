import type { Routes } from "@angular/router";
import { Home } from "./home.ts";
import { DocPage } from "./page.ts";
import { CoveragePage } from "./coverage.ts";

export const routes: Routes = [
  { path: "", component: Home, title: "Bun × Material 3" },
  { path: "docs/:name", component: DocPage },
  { path: "coverage", component: CoveragePage, title: "Coverage" },
  { path: "**", redirectTo: "" },
];
