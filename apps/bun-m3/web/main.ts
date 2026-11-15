// Angular in JIT mode: templates are compiled in the browser by @angular/compiler. Angular's ahead-of-time
// template compiler needs the TypeScript 6 compiler API (angular/angular#69704); TypeScript 7 has none until 7.1,
// so the app compiles with Bun's transpiler alone and moves to Angular AOT when compiler-cli supports TS 7.
import "@angular/compiler";
import { provideZonelessChangeDetection } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { provideRouter, withComponentInputBinding } from "@angular/router";
import { MatIconRegistry } from "@angular/material/icon";
import { inject, provideAppInitializer } from "@angular/core";
import { App } from "./app/app.ts";
import { routes } from "./app/routes.ts";

bootstrapApplication(App, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideAppInitializer(() => inject(MatIconRegistry).setDefaultFontSetClass("material-symbols-outlined")),
  ],
}).catch((e) => console.error(e));
