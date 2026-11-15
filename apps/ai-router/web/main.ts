// Angular in JIT mode (no TypeScript 6 compiler API is shipped; see decision D3 in docs/roadmap/decisions.md).
import "@angular/compiler";
import { inject, provideAppInitializer, provideZonelessChangeDetection } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { MatIconRegistry } from "@angular/material/icon";
import { App } from "./app.ts";

bootstrapApplication(App, {
  providers: [provideZonelessChangeDetection(), provideAppInitializer(() => void inject(MatIconRegistry).setDefaultFontSetClass("material-symbols-outlined"))],
}).catch((e) => console.error(e));
