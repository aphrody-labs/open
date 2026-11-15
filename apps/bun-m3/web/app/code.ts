// One code example of a doc page: the usage of the feature the page describes, run by the server on Bun.
import { Component, Input, computed, inject } from "@angular/core";
import { ClipboardModule } from "@angular/cdk/clipboard";
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheet, MatBottomSheetModule } from "@angular/material/bottom-sheet";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatChipsModule } from "@angular/material/chips";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatTooltipModule } from "@angular/material/tooltip";
import type { Block, Run } from "./store.ts";
import { PageState } from "./state.ts";

@Component({
  selector: "app-apis-sheet",
  imports: [MatBottomSheetModule, MatListModule],
  template: `
    <h3 class="t">{{ data.length }} Bun APIs accessed</h3>
    <mat-list>@for (a of data; track a) { <mat-list-item><span matListItemTitle class="mono">{{ a }}</span></mat-list-item> }</mat-list>
  `,
  styles: `.t { font: var(--mat-sys-title-medium); margin: 16px; } .mono { font-family: "Roboto Mono Variable", monospace; }`,
})
export class ApisSheet {
  readonly data = inject<string[]>(MAT_BOTTOM_SHEET_DATA);
}

const kindIcon = { script: "code", test: "science", shell: "terminal" } as const;

@Component({
  selector: "app-code",
  imports: [ClipboardModule, MatButtonModule, MatCardModule, MatChipsModule, MatExpansionModule, MatIconModule, MatProgressSpinnerModule, MatTooltipModule],
  template: `
    <mat-card appearance="outlined" class="code">
      <div class="bar">
        <mat-icon class="kind">{{ icon() }}</mat-icon>
        <span class="file">{{ block.file ?? block.lang ?? "text" }}</span>
        <span class="grow"></span>
        <button matIconButton [cdkCopyToClipboard]="block.code" matTooltip="Copy" aria-label="Copy code"><mat-icon>content_copy</mat-icon></button>
        @if (block.run) {
          @if (running()) {
            <mat-spinner diameter="20" aria-label="Running" />
          } @else {
            <button matButton="tonal" (click)="state.run(block.id)" [matTooltip]="'Run with ' + (block.run === 'test' ? 'bun test' : block.run === 'shell' ? 'the Bun shell' : 'bun run')">
              <mat-icon>play_arrow</mat-icon>Run
            </button>
          }
        }
      </div>
      <pre><code>{{ block.code }}</code></pre>
      @if (run(); as r) {
        <div class="result">
          <mat-chip-set aria-label="Result">
            <mat-chip [highlighted]="r.status === 'pass'" [attr.data-status]="r.status"><mat-icon matChipAvatar>{{ statusIcon[r.status] }}</mat-icon>{{ r.status }}</mat-chip>
            @if (r.exit !== null) { <mat-chip>exit {{ r.exit }}</mat-chip> }
            <mat-chip>{{ ms(r) }} ms</mat-chip>
            @if (r.apis.length) { <mat-chip (click)="showApis(r)" class="link"><mat-icon matChipAvatar>api</mat-icon>{{ r.apis.length }} APIs</mat-chip> }
          </mat-chip-set>
          @if (r.reason) { <p class="reason">{{ r.reason }}</p> }
          @if (r.stdout || r.stderr) {
            <mat-expansion-panel [expanded]="r.status !== 'pass'">
              <mat-expansion-panel-header><mat-panel-title>Output</mat-panel-title></mat-expansion-panel-header>
              @if (r.stdout) { <pre class="out">{{ r.stdout }}</pre> }
              @if (r.stderr) { <pre class="err">{{ r.stderr }}</pre> }
            </mat-expansion-panel>
          }
        </div>
      }
    </mat-card>
  `,
  styles: `
    .code { margin: 16px 0; overflow: hidden; }
    .bar { display: flex; align-items: center; gap: 8px; padding: 4px 8px 4px 16px; background: var(--mat-sys-surface-container); }
    .kind { color: var(--mat-sys-primary); }
    .file { font: var(--mat-sys-label-large); font-family: "Roboto Mono Variable", monospace; }
    .grow { flex: 1; }
    pre { margin: 0; padding: 12px 16px; overflow: auto; font-size: 13px; line-height: 1.5; }
    .result { padding: 8px 16px 16px; display: grid; gap: 8px; }
    .out { background: var(--mat-sys-surface-container-low); }
    .err { background: var(--mat-sys-error-container); color: var(--mat-sys-on-error-container); }
    .reason { font: var(--mat-sys-body-small); color: var(--mat-sys-on-surface-variant); margin: 0; }
    .link { cursor: pointer; }
  `,
})
export class CodeBlock {
  @Input({ required: true }) block!: Extract<Block, { t: "code" }>;
  readonly state = inject(PageState);
  private readonly sheet = inject(MatBottomSheet);
  readonly statusIcon: Record<string, string> = { pass: "check_circle", fail: "error", timeout: "timer", serving: "dns", skipped: "block" };
  readonly run = computed(() => this.state.runs().get(this.block.id) ?? null);
  readonly running = computed(() => this.state.running().has(this.block.id));
  icon() {
    return this.block.run ? kindIcon[this.block.run] : "notes";
  }
  ms(r: Run) {
    return Math.round(r.ms);
  }
  showApis(r: Run) {
    this.sheet.open(ApisSheet, { data: r.apis });
  }
}
