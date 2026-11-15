import { Component, computed, inject, signal, afterEveryRender } from "@angular/core";
import { BreakpointObserver } from "@angular/cdk/layout";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatBadgeModule } from "@angular/material/badge";
import { MatButtonModule } from "@angular/material/button";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatDividerModule } from "@angular/material/divider";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatListModule } from "@angular/material/list";
import { MatMenuModule } from "@angular/material/menu";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatSliderModule } from "@angular/material/slider";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatTooltipModule } from "@angular/material/tooltip";
import { toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs";
import { Store } from "./store.ts";

const contrasts = ["standard", "medium", "high"] as const;
const statusIcon: Record<string, string> = { pass: "check_circle", fail: "error", timeout: "timer", serving: "dns", skipped: "block" };

@Component({
  selector: "app-root",
  imports: [
    ReactiveFormsModule, RouterOutlet, RouterLink, RouterLinkActive, MatAutocompleteModule, MatBadgeModule, MatButtonModule, MatButtonToggleModule,
    MatDividerModule, MatFormFieldModule, MatIconModule, MatInputModule, MatListModule, MatMenuModule, MatProgressBarModule, MatSidenavModule,
    MatSliderModule, MatSnackBarModule, MatToolbarModule, MatTooltipModule,
  ],
  template: `
    <mat-sidenav-container class="shell">
      <mat-sidenav #nav [mode]="wide() ? 'side' : 'over'" [opened]="wide()" class="drawer" aria-label="Navigation">
        <mat-nav-list>
          <a mat-list-item routerLink="/" [routerLinkActiveOptions]="{ exact: true }" routerLinkActive #home="routerLinkActive" [activated]="home.isActive">
            <mat-icon matListItemIcon>home</mat-icon><span matListItemTitle>Overview</span>
          </a>
          <a mat-list-item routerLink="/coverage" routerLinkActive #cov="routerLinkActive" [activated]="cov.isActive">
            <mat-icon matListItemIcon>fact_check</mat-icon><span matListItemTitle>Coverage</span>
          </a>
          <mat-divider />
          <h2 matSubheader>Sections</h2>
          @for (s of store.sections(); track s.name) {
            <a mat-list-item routerLink="/" [queryParams]="{ section: s.name }">
              <mat-icon matListItemIcon>folder</mat-icon>
              <span matListItemTitle>{{ s.name }}</span>
              <span matListItemMeta class="count">{{ s.count }}</span>
            </a>
          }
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav #log position="end" mode="over" class="sheet" aria-label="Run log">
        <mat-toolbar>
          <span>Run log</span><span class="grow"></span>
          <button matIconButton (click)="log.close()" aria-label="Close run log"><mat-icon>close</mat-icon></button>
        </mat-toolbar>
        @if (store.job(); as j) {
          <p class="pad">{{ j.done }} / {{ j.total }} examples, started {{ j.started }}</p>
        }
        <mat-list>
          @for (e of store.events(); track $index) {
            @if (e.type === "run") {
              <mat-list-item>
                <mat-icon matListItemIcon>{{ icon(e.status!) }}</mat-icon>
                <span matListItemTitle>{{ e.skill }} #{{ e.id }}</span>
                <span matListItemLine>{{ e.status }}</span>
              </mat-list-item>
            }
          } @empty {
            <mat-list-item><span matListItemTitle>No run yet</span></mat-list-item>
          }
        </mat-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar class="appbar">
          <button matIconButton (click)="nav.toggle()" aria-label="Toggle navigation"><mat-icon>menu</mat-icon></button>
          <a class="title" routerLink="/">Bun × Material 3</a>
          <mat-form-field class="search" appearance="outline" subscriptSizing="dynamic">
            <mat-icon matPrefix>search</mat-icon>
            <input matInput placeholder="Search the Bun docs" aria-label="Search the Bun docs" [formControl]="q" [matAutocomplete]="auto" />
            <mat-autocomplete #auto (optionSelected)="open($event.option.value)">
              @for (e of matches(); track e.name) {
                <mat-option [value]="e.name"><span>{{ e.title }}</span> <small class="muted">{{ e.section }}</small></mat-option>
              }
            </mat-autocomplete>
          </mat-form-field>
          <span class="grow"></span>
          <button matIconButton [matMenuTriggerFor]="themeMenu" matTooltip="Theme" aria-label="Theme"><mat-icon>palette</mat-icon></button>
          <button matIconButton (click)="log.toggle()" matTooltip="Run log" aria-label="Run log"
            [matBadge]="store.job()?.done ?? 0" [matBadgeHidden]="!store.job()" matBadgeSize="small"><mat-icon>terminal</mat-icon></button>
        </mat-toolbar>
        @if (progress(); as p) {
          <mat-progress-bar mode="determinate" [value]="p" aria-label="Run progress" />
        }
        <mat-menu #themeMenu="matMenu">
          <div class="menu-panel" (click)="$event.stopPropagation()" (keydown)="$event.stopPropagation()">
            <span class="label">Colour scheme</span>
            <mat-button-toggle-group [value]="scheme()" (change)="setScheme($event.value)" aria-label="Colour scheme">
              <mat-button-toggle value="light" aria-label="Light"><mat-icon>light_mode</mat-icon></mat-button-toggle>
              <mat-button-toggle value="system" aria-label="System"><mat-icon>brightness_auto</mat-icon></mat-button-toggle>
              <mat-button-toggle value="dark" aria-label="Dark"><mat-icon>dark_mode</mat-icon></mat-button-toggle>
            </mat-button-toggle-group>
            <span class="label">Contrast: {{ contrastName() }}</span>
            <mat-slider min="0" max="2" step="1" discrete showTickMarks [displayWith]="contrastLabel">
              <input matSliderThumb [value]="contrast()" (valueChange)="setContrast($event)" aria-label="Contrast" />
            </mat-slider>
          </div>
        </mat-menu>
        <main><router-outlet /></main>
        <button matFab extended class="fab" (click)="runAll()" [disabled]="running()">
          <mat-icon>play_arrow</mat-icon>{{ running() ? "Running" : "Run every example" }}
        </button>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: `
    .shell { height: 100dvh; }
    .drawer { width: 300px; }
    .sheet { width: min(420px, 90vw); }
    .appbar { position: sticky; top: 0; z-index: 2; gap: 8px; background: var(--mat-sys-surface-container); }
    .title { font: var(--mat-sys-title-large); color: inherit; text-decoration: none; white-space: nowrap; }
    .search { width: min(480px, 40vw); font: var(--mat-sys-body-large); }
    .grow { flex: 1; }
    .muted { color: var(--mat-sys-on-surface-variant); }
    .count { margin-inline-end: 16px; }
    .pad { padding: 0 16px; }
    main { padding: 16px 24px 96px; max-width: 1200px; margin-inline: auto; }
    .fab { position: fixed; inset-inline-end: 24px; inset-block-end: 24px; }
    .menu-panel { display: grid; gap: 8px; padding: 12px 16px; min-width: 240px; }
    .label { font: var(--mat-sys-label-large); }
    @media (max-width: 599px) { main { padding: 16px 16px 96px; } .search { width: 40vw; } }
  `,
})
export class App {
  readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly snack = inject(MatSnackBar);
  readonly wide = toSignal(inject(BreakpointObserver).observe("(min-width: 840px)").pipe(map((r) => r.matches)), { initialValue: true });
  readonly q = new FormControl("", { nonNullable: true });
  private readonly query = toSignal(this.q.valueChanges, { initialValue: "" });
  readonly matches = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return [];
    return this.store.index().filter((e) => e.title.toLowerCase().includes(q) || e.name.includes(q) || e.description.toLowerCase().includes(q)).slice(0, 20);
  });
  readonly scheme = signal(localStorage.getItem("scheme") ?? "system");
  readonly contrast = signal(Number(localStorage.getItem("contrast") ?? 0));
  readonly contrastName = computed(() => contrasts[this.contrast()]);
  readonly running = computed(() => !!this.store.job() && this.store.job()!.done < this.store.job()!.total);
  readonly progress = computed(() => (this.running() ? (100 * this.store.job()!.done) / this.store.job()!.total : null));
  readonly contrastLabel = (v: number) => contrasts[v]!.slice(0, 3);

  constructor() {
    this.apply();
    // record which M3 components are on screen after each render (coverage proof)
    afterEveryRender(() => {
      const c = this.store.coverage();
      if (c) this.store.markRendered(c.kit.components.map((x) => x.selector).filter((s): s is string => !!s));
    });
  }
  icon(status: string) {
    return statusIcon[status] ?? "help";
  }
  open(name: string) {
    this.q.setValue("");
    this.router.navigate(["/docs", name]);
  }
  setScheme(v: string) {
    this.scheme.set(v);
    localStorage.setItem("scheme", v);
    this.apply();
  }
  setContrast(v: number) {
    this.contrast.set(v);
    localStorage.setItem("contrast", String(v));
    this.apply();
  }
  private apply() {
    const html = document.documentElement;
    if (this.scheme() === "system") delete html.dataset.scheme;
    else html.dataset.scheme = this.scheme();
    html.dataset.contrast = contrasts[this.contrast()]!;
  }
  async runAll() {
    await this.store.runAll();
    this.snack.open(`Running ${this.store.job()?.total ?? 0} examples`, "Run log", { duration: 4000 });
  }
}
