import { AfterViewInit, Component, Input, ViewChild, computed, effect, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { DecimalPipe } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatChipsModule } from "@angular/material/chips";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { Store, type Entry } from "./store.ts";

@Component({
  selector: "app-home",
  imports: [RouterLink, DecimalPipe, MatCardModule, MatCheckboxModule, MatChipsModule, MatFormFieldModule, MatGridListModule, MatIconModule, MatInputModule, MatPaginatorModule, MatProgressBarModule, MatSortModule, MatTableModule],
  template: `
    <h1 class="display">Every Bun doc page, run and rendered in Material 3</h1>
    <div class="cards">
      <mat-card appearance="raised">
        <mat-card-header><mat-icon mat-card-avatar>description</mat-icon><mat-card-title>Docs</mat-card-title><mat-card-subtitle>aphrody-labs/bun fork</mat-card-subtitle></mat-card-header>
        <mat-card-content>
          <p class="num">{{ store.index().length | number }} pages</p>
          <p>{{ examples() | number }} examples, {{ runnable() | number }} runnable</p>
        </mat-card-content>
      </mat-card>
      @if (store.coverage(); as c) {
        <mat-card appearance="raised">
          <mat-card-header><mat-icon mat-card-avatar>api</mat-icon><mat-card-title>Bun API used</mat-card-title><mat-card-subtitle>Bun {{ c.bun.version }}</mat-card-subtitle></mat-card-header>
          <mat-card-content>
            <p class="num">{{ c.bun.used }} / {{ c.bun.total }}</p>
            <mat-progress-bar mode="determinate" [value]="(100 * c.bun.used) / c.bun.total" aria-label="Bun API coverage" />
          </mat-card-content>
          <mat-card-actions><a matButton routerLink="/coverage">Details</a></mat-card-actions>
        </mat-card>
        <mat-card appearance="raised">
          <mat-card-header><mat-icon mat-card-avatar>widgets</mat-icon><mat-card-title>Material 3 kit</mat-card-title><mat-card-subtitle>{{ c.kit.componentSets }} Figma component sets</mat-card-subtitle></mat-card-header>
          <mat-card-content>
            <p class="num">{{ c.kit.implemented }} / {{ c.kit.m3Components }}</p>
            <mat-progress-bar mode="determinate" [value]="(100 * c.kit.implemented) / c.kit.m3Components" aria-label="Material 3 coverage" />
          </mat-card-content>
          <mat-card-actions><a matButton routerLink="/coverage" fragment="kit">Details</a></mat-card-actions>
        </mat-card>
        <mat-card appearance="raised">
          <mat-card-header><mat-icon mat-card-avatar>play_circle</mat-icon><mat-card-title>Runs</mat-card-title><mat-card-subtitle>{{ c.runs.executed | number }} of {{ c.runs.runnable | number }}</mat-card-subtitle></mat-card-header>
          <mat-card-content>
            <mat-chip-set aria-label="Run results">
              <mat-chip><mat-icon matChipAvatar>check_circle</mat-icon>{{ c.runs.status.pass ?? 0 }} pass</mat-chip>
              <mat-chip><mat-icon matChipAvatar>error</mat-icon>{{ c.runs.status.fail ?? 0 }} fail</mat-chip>
              <mat-chip><mat-icon matChipAvatar>timer</mat-icon>{{ c.runs.status.timeout ?? 0 }} timeout</mat-chip>
              <mat-chip><mat-icon matChipAvatar>block</mat-icon>{{ c.runs.status.skipped ?? 0 }} skipped</mat-chip>
            </mat-chip-set>
          </mat-card-content>
        </mat-card>
      }
    </div>

    <h2 class="headline">Sections</h2>
    <mat-grid-list [cols]="cols()" rowHeight="96px" gutterSize="12px">
      @for (s of store.sections(); track s.name) {
        <mat-grid-tile>
          <a class="tile" [class.on]="section() === s.name" routerLink="/" [queryParams]="{ section: section() === s.name ? null : s.name }">
            <span class="tile-title">{{ s.name }}</span><span class="tile-count">{{ s.count }} pages</span>
          </a>
        </mat-grid-tile>
      }
    </mat-grid-list>

    <h2 class="headline">Pages</h2>
    <div class="filters">
      <mat-form-field appearance="outline" subscriptSizing="dynamic">
        <mat-label>Filter</mat-label>
        <input matInput (input)="text.set($any($event.target).value)" />
      </mat-form-field>
      <mat-chip-listbox aria-label="Section" [value]="section()" (change)="section.set($event.value ?? '')">
        @for (s of store.sections(); track s.name) { <mat-chip-option [value]="s.name">{{ s.name }}</mat-chip-option> }
      </mat-chip-listbox>
      <mat-checkbox [checked]="runnableOnly()" (change)="runnableOnly.set($event.checked)">Runnable examples only</mat-checkbox>
    </div>
    <table mat-table [dataSource]="data" matSort class="table">
      <ng-container matColumnDef="title">
        <th mat-header-cell *matHeaderCellDef mat-sort-header>Page</th>
        <td mat-cell *matCellDef="let e"><a [routerLink]="['/docs', e.name]">{{ e.title }}</a><div class="muted">{{ e.description }}</div></td>
      </ng-container>
      <ng-container matColumnDef="section">
        <th mat-header-cell *matHeaderCellDef mat-sort-header>Section</th>
        <td mat-cell *matCellDef="let e">{{ e.section }}</td>
      </ng-container>
      <ng-container matColumnDef="examples">
        <th mat-header-cell *matHeaderCellDef mat-sort-header>Examples</th>
        <td mat-cell *matCellDef="let e">{{ e.examples }}</td>
      </ng-container>
      <ng-container matColumnDef="runnable">
        <th mat-header-cell *matHeaderCellDef mat-sort-header>Runnable</th>
        <td mat-cell *matCellDef="let e">{{ e.runnable }}</td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="columns"></tr>
      <tr mat-row *matRowDef="let row; columns: columns"></tr>
    </table>
    <mat-paginator [pageSizeOptions]="[25, 50, 100, 500]" [pageSize]="25" aria-label="Pages" />
  `,
  styles: `
    .display { font: var(--mat-sys-headline-large); margin: 8px 0 24px; }
    .headline { font: var(--mat-sys-title-large); margin: 32px 0 12px; }
    .cards { display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }
    .num { font: var(--mat-sys-display-small); margin: 8px 0; }
    .tile { display: grid; place-content: center; text-align: center; width: 100%; height: 100%; border-radius: var(--mat-sys-corner-large); background: var(--mat-sys-surface-container-high); color: var(--mat-sys-on-surface); text-decoration: none; }
    .tile.on { background: var(--mat-sys-secondary-container); color: var(--mat-sys-on-secondary-container); }
    .tile-title { font: var(--mat-sys-title-medium); }
    .tile-count { font: var(--mat-sys-body-small); }
    .filters { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; margin-bottom: 12px; }
    .table { width: 100%; }
    .muted { color: var(--mat-sys-on-surface-variant); font: var(--mat-sys-body-small); }
  `,
})
export class Home implements AfterViewInit {
  readonly store = inject(Store);
  readonly columns = ["title", "section", "examples", "runnable"];
  readonly data = new MatTableDataSource<Entry>([]);
  readonly section = signal("");
  readonly text = signal("");
  readonly runnableOnly = signal(false);
  readonly examples = computed(() => this.store.index().reduce((a, e) => a + e.examples, 0));
  readonly runnable = computed(() => this.store.index().reduce((a, e) => a + e.runnable, 0));
  readonly cols = signal(Math.max(2, Math.min(6, Math.floor(innerWidth / 220))));
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  @Input("section") set sectionParam(v: string | undefined) {
    this.section.set(v ?? "");
  }

  constructor() {
    effect(() => {
      const s = this.section(), t = this.text().toLowerCase(), r = this.runnableOnly();
      this.data.data = this.store.index().filter((e) => (!s || e.section === s) && (!r || e.runnable > 0) && (!t || e.title.toLowerCase().includes(t) || e.description.toLowerCase().includes(t)));
    });
  }
  ngAfterViewInit() {
    this.data.sort = this.sort;
    this.data.paginator = this.paginator;
  }
}
