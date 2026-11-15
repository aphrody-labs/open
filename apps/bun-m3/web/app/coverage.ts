// Coverage proof: the Bun API surface of the running Bun against what the executed examples accessed, and the
// Material 3 components of the Figma kit against the Angular Material components rendered in this session.
import { AfterViewInit, Component, ViewChild, computed, effect, inject, signal } from "@angular/core";
import { DatePipe, DecimalPipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatChipsModule } from "@angular/material/chips";
import { provideNativeDateAdapter } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatRadioModule } from "@angular/material/radio";
import { MatSelectModule } from "@angular/material/select";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatTabsModule } from "@angular/material/tabs";
import { MatTimepickerModule } from "@angular/material/timepicker";
import { MatTreeModule } from "@angular/material/tree";
import { Store, type Coverage } from "./store.ts";

type ApiRow = Coverage["bun"]["entries"][number];
type Node = { name: string; path: string; used: boolean; children: Node[] };

function tree(entries: ApiRow[]): Node[] {
  const root: Node = { name: "", path: "", used: false, children: [] };
  for (const e of entries) {
    const parts = e.name.split(/(?<=^bun:\w+):|\./);
    let n = root;
    parts.forEach((p, i) => {
      let c = n.children.find((x) => x.name === p);
      if (!c) n.children.push((c = { name: p, path: parts.slice(0, i + 1).join("."), used: false, children: [] }));
      n = c;
    });
    n.used = e.used;
  }
  const mark = (n: Node): boolean => (n.used = n.children.map(mark).some(Boolean) || n.used);
  root.children.forEach(mark);
  return root.children;
}

@Component({
  selector: "app-coverage",
  imports: [DatePipe, DecimalPipe, FormsModule, MatButtonModule, MatChipsModule, MatDatepickerModule, MatFormFieldModule, MatIconModule, MatInputModule, MatPaginatorModule, MatProgressBarModule, MatRadioModule, MatSelectModule, MatSlideToggleModule, MatSortModule, MatTableModule, MatTabsModule, MatTimepickerModule, MatTreeModule],
  providers: [provideNativeDateAdapter()],
  template: `
    <h1 class="display">Coverage</h1>
    @if (store.coverage(); as c) {
      <mat-tab-group [selectedIndex]="tab()" (selectedIndexChange)="tab.set($event)" mat-stretch-tabs="false">
        <mat-tab label="Bun API">
          <p class="lead">Bun {{ c.bun.version }} ({{ c.bun.revision.slice(0, 9) }}): {{ c.bun.used }} of {{ c.bun.total }} API entries used by {{ c.runs.executed | number }} executed examples ({{ c.runs.confinement }}). A function counts when called, a class when constructed or a static member is called, a namespace when read or a member is used, a value when read.</p>
          <mat-progress-bar mode="determinate" [value]="(100 * c.bun.used) / c.bun.total" aria-label="Bun API coverage" />
          <div class="filters">
            <mat-radio-group [ngModel]="show()" (ngModelChange)="show.set($event)" aria-label="Show">
              <mat-radio-button value="all">All</mat-radio-button>
              <mat-radio-button value="used">Used</mat-radio-button>
              <mat-radio-button value="unused">Not used</mat-radio-button>
            </mat-radio-group>
            <mat-form-field appearance="outline" subscriptSizing="dynamic">
              <mat-label>Kind</mat-label>
              <mat-select [ngModel]="kind()" (ngModelChange)="kind.set($event)">
                <mat-option value="">Any</mat-option>
                @for (k of kinds(); track k) { <mat-option [value]="k">{{ k }}</mat-option> }
              </mat-select>
            </mat-form-field>
            <mat-slide-toggle [ngModel]="asTree()" (ngModelChange)="asTree.set($event)">Tree</mat-slide-toggle>
          </div>
          @if (asTree()) {
            <mat-tree [dataSource]="nodes()" [childrenAccessor]="children" class="tree">
              <mat-tree-node *matTreeNodeDef="let n" matTreeNodePadding>
                <mat-icon class="dot" [class.on]="n.used">{{ n.used ? "check_circle" : "radio_button_unchecked" }}</mat-icon><span class="mono">{{ n.name }}</span>
              </mat-tree-node>
              <mat-tree-node *matTreeNodeDef="let n; when: hasChildren" matTreeNodePadding matTreeNodeToggle>
                <button matIconButton matTreeNodeToggle [attr.aria-label]="'Toggle ' + n.name"><mat-icon>chevron_right</mat-icon></button>
                <mat-icon class="dot" [class.on]="n.used">{{ n.used ? "check_circle" : "radio_button_unchecked" }}</mat-icon><span class="mono">{{ n.name }}</span>
              </mat-tree-node>
            </mat-tree>
          } @else {
            <table mat-table [dataSource]="apis" matSort #apiSort="matSort" class="table">
              <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef mat-sort-header>API</th><td mat-cell *matCellDef="let e" class="mono">{{ e.name }}</td></ng-container>
              <ng-container matColumnDef="kind"><th mat-header-cell *matHeaderCellDef mat-sort-header>Kind</th><td mat-cell *matCellDef="let e">{{ e.kind }}</td></ng-container>
              <ng-container matColumnDef="calls"><th mat-header-cell *matHeaderCellDef mat-sort-header>Examples</th><td mat-cell *matCellDef="let e">{{ e.calls }}</td></ng-container>
              <ng-container matColumnDef="used"><th mat-header-cell *matHeaderCellDef mat-sort-header>Used</th><td mat-cell *matCellDef="let e"><mat-icon [class.on]="e.used" class="dot">{{ e.used ? "check_circle" : "radio_button_unchecked" }}</mat-icon></td></ng-container>
              <tr mat-header-row *matHeaderRowDef="apiCols"></tr>
              <tr mat-row *matRowDef="let row; columns: apiCols"></tr>
            </table>
            <mat-paginator #apiPage [pageSizeOptions]="[25, 100, 500]" [pageSize]="25" aria-label="API entries" />
          }
        </mat-tab>
        <mat-tab label="Material 3 kit">
          <p class="lead">{{ c.kit.m3Components }} Material 3 components ({{ c.kit.componentSets }} component sets in the Figma Material 3 Design Kit). Angular Material implements {{ c.kit.implemented }}; {{ rendered() }} rendered in this session.</p>
          <table mat-table [dataSource]="c.kit.components" class="table">
            <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef>M3 component</th><td mat-cell *matCellDef="let k">{{ k.name }}</td></ng-container>
            <ng-container matColumnDef="figma"><th mat-header-cell *matHeaderCellDef>Figma sets</th><td mat-cell *matCellDef="let k">{{ k.figma }}</td></ng-container>
            <ng-container matColumnDef="angular"><th mat-header-cell *matHeaderCellDef>Angular Material</th><td mat-cell *matCellDef="let k">{{ k.angular ?? "none" }}@if (k.partial) { <div class="muted">{{ k.partial }}</div> }@if (k.reason) { <div class="muted">{{ k.reason }}</div> }</td></ng-container>
            <ng-container matColumnDef="rendered"><th mat-header-cell *matHeaderCellDef>Rendered</th><td mat-cell *matCellDef="let k"><mat-icon class="dot" [class.on]="isRendered(k.selector)">{{ isRendered(k.selector) ? "check_circle" : k.angular ? "radio_button_unchecked" : "block" }}</mat-icon></td></ng-container>
            <tr mat-header-row *matHeaderRowDef="kitCols"></tr>
            <tr mat-row *matRowDef="let row; columns: kitCols"></tr>
          </table>
        </mat-tab>
        <mat-tab label="Runs">
          <div class="filters">
            <mat-form-field appearance="outline" subscriptSizing="dynamic">
              <mat-label>Since day</mat-label>
              <input matInput [matDatepicker]="day" [ngModel]="since()" (ngModelChange)="since.set($event)" />
              <mat-datepicker-toggle matIconSuffix [for]="day" />
              <mat-datepicker #day />
            </mat-form-field>
            <mat-form-field appearance="outline" subscriptSizing="dynamic">
              <mat-label>Since time</mat-label>
              <input matInput [matTimepicker]="time" [ngModel]="since()" (ngModelChange)="since.set($event)" />
              <mat-timepicker-toggle matIconSuffix [for]="time" />
              <mat-timepicker #time />
            </mat-form-field>
          </div>
          <mat-chip-set aria-label="Run results">
            @for (s of statuses(); track s.status) { <mat-chip>{{ s.status }}: {{ s.count | number }}</mat-chip> }
          </mat-chip-set>
          <table mat-table [dataSource]="runs" class="table">
            <ng-container matColumnDef="skill"><th mat-header-cell *matHeaderCellDef>Page</th><td mat-cell *matCellDef="let r">{{ r.skill }} #{{ r.id }}</td></ng-container>
            <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef>Status</th><td mat-cell *matCellDef="let r">{{ r.status }}</td></ng-container>
            <ng-container matColumnDef="ms"><th mat-header-cell *matHeaderCellDef>ms</th><td mat-cell *matCellDef="let r">{{ r.ms | number: "1.0-0" }}</td></ng-container>
            <ng-container matColumnDef="at"><th mat-header-cell *matHeaderCellDef>At</th><td mat-cell *matCellDef="let r">{{ r.at | date: "short" }}</td></ng-container>
            <tr mat-header-row *matHeaderRowDef="runCols"></tr>
            <tr mat-row *matRowDef="let row; columns: runCols"></tr>
          </table>
          <mat-paginator #runPage [pageSizeOptions]="[25, 100, 500]" [pageSize]="25" aria-label="Runs" />
        </mat-tab>
      </mat-tab-group>
    }
  `,
  styles: `
    .display { font: var(--mat-sys-headline-large); margin: 8px 0 16px; }
    .lead { font: var(--mat-sys-body-large); }
    .filters { display: flex; flex-wrap: wrap; gap: 16px; align-items: center; margin: 16px 0; }
    .table { width: 100%; }
    .mono { font-family: "Roboto Mono Variable", monospace; }
    .muted { font: var(--mat-sys-body-small); color: var(--mat-sys-on-surface-variant); }
    .dot { color: var(--mat-sys-outline); vertical-align: middle; }
    .dot.on { color: var(--mat-sys-primary); }
    .tree { background: transparent; }
  `,
})
export class CoveragePage implements AfterViewInit {
  readonly store = inject(Store);
  readonly apiCols = ["name", "kind", "calls", "used"];
  readonly kitCols = ["name", "figma", "angular", "rendered"];
  readonly runCols = ["skill", "status", "ms", "at"];
  readonly apis = new MatTableDataSource<ApiRow>([]);
  readonly runs = new MatTableDataSource<{ skill: string; id: number; status: string; ms: number; at: string }>([]);
  readonly tab = signal(location.hash === "#kit" ? 1 : 0);
  readonly show = signal<"all" | "used" | "unused">("all");
  readonly kind = signal("");
  readonly asTree = signal(false);
  readonly since = signal<Date | null>(null);
  readonly allRuns = signal<{ skill: string; id: number; status: string; ms: number; at: string }[]>([]);
  readonly kinds = computed(() => [...new Set(this.store.coverage()?.bun.entries.map((e) => e.kind) ?? [])].sort());
  readonly nodes = computed(() => tree(this.store.coverage()?.bun.entries ?? []));
  readonly rendered = computed(() => this.store.coverage()?.kit.components.filter((k) => this.isRendered(k.selector)).length ?? 0);
  readonly statuses = computed(() => [...Map.groupBy(this.filteredRuns(), (r) => r.status)].map(([status, xs]) => ({ status, count: xs.length })));
  private readonly filteredRuns = computed(() => {
    const t = this.since()?.getTime() ?? 0;
    return this.allRuns().filter((r) => Date.parse(r.at) >= t);
  });
  readonly children = (n: Node) => n.children;
  readonly hasChildren = (_: number, n: Node) => n.children.length > 0;
  @ViewChild("apiSort") sort?: MatSort;
  @ViewChild("apiPage") apiPage?: MatPaginator;
  @ViewChild("runPage") runPage?: MatPaginator;

  constructor() {
    effect(() => {
      const s = this.show(), k = this.kind();
      this.apis.data = (this.store.coverage()?.bun.entries ?? []).filter((e) => (s === "all" || (s === "used") === e.used) && (!k || e.kind === k));
    });
    effect(() => (this.runs.data = this.filteredRuns()));
    fetch("/api/runs").then((r) => r.json()).then((xs) => this.allRuns.set(xs));
    this.store.refreshCoverage();
  }
  ngAfterViewInit() {
    queueMicrotask(() => {
      if (this.sort) this.apis.sort = this.sort;
      if (this.apiPage) this.apis.paginator = this.apiPage;
      if (this.runPage) this.runs.paginator = this.runPage;
    });
  }
  isRendered(selector: string | null) {
    return !!selector && this.store.rendered().has(selector);
  }
}
