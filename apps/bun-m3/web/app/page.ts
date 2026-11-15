import { Component, Input, computed, inject, signal } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { MatButtonModule } from "@angular/material/button";
import { MatChipsModule } from "@angular/material/chips";
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { Store, type Block, type Page } from "./store.ts";
import { PageState } from "./state.ts";
import { Blocks } from "./blocks.ts";

@Component({
  selector: "app-skill-dialog",
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>SKILL.md</h2>
    <mat-dialog-content><pre>{{ data }}</pre></mat-dialog-content>
    <mat-dialog-actions align="end"><button matButton mat-dialog-close>Close</button></mat-dialog-actions>
  `,
  styles: `pre { white-space: pre-wrap; font-size: 13px; }`,
})
export class SkillDialog {
  readonly data = inject<string>(MAT_DIALOG_DATA);
}

@Component({
  selector: "app-doc-page",
  imports: [Blocks, MatButtonModule, MatChipsModule, MatIconModule, MatMenuModule, MatProgressSpinnerModule],
  providers: [PageState],
  template: `
    @if (page(); as p) {
      <header class="head">
        <h1 class="title">{{ p.title }}</h1>
        <p class="desc">{{ p.description }}</p>
        <mat-chip-set aria-label="Page facts">
          <mat-chip><mat-icon matChipAvatar>folder</mat-icon>{{ p.tab }} / {{ p.group }}</mat-chip>
          <mat-chip><mat-icon matChipAvatar>code</mat-icon>{{ runnable() }} runnable of {{ total() }} examples</mat-chip>
          <mat-chip><mat-icon matChipAvatar>data_object</mat-icon>{{ p.parser }}</mat-chip>
        </mat-chip-set>
        <div class="actions">
          <button matButton="filled" (click)="runPage()" [disabled]="busy() || !runnable()"><mat-icon>play_arrow</mat-icon>Run the page's examples</button>
          <button matButton="outlined" (click)="showSkill(p)"><mat-icon>auto_awesome</mat-icon>Skill</button>
          <button matIconButton [matMenuTriggerFor]="more" aria-label="More"><mat-icon>more_vert</mat-icon></button>
          <mat-menu #more="matMenu">
            @if (store.sources(); as s) {
              <a mat-menu-item [href]="s.web + '/blob/' + s.rev + '/docs/' + p.source" target="_blank" rel="noopener"><mat-icon>open_in_new</mat-icon>MDX source at {{ s.rev.slice(0, 9) }}</a>
            }
          </mat-menu>
          @if (busy()) { <mat-spinner diameter="24" aria-label="Running" /> }
        </div>
      </header>
      <app-blocks [blocks]="p.blocks" />
    } @else {
      <mat-spinner aria-label="Loading" />
    }
  `,
  styles: `
    .head { margin-bottom: 24px; }
    .title { font: var(--mat-sys-headline-large); margin: 8px 0; }
    .desc { font: var(--mat-sys-body-large); color: var(--mat-sys-on-surface-variant); }
    .actions { display: flex; gap: 8px; align-items: center; margin-top: 16px; flex-wrap: wrap; }
  `,
})
export class DocPage {
  readonly store = inject(Store);
  private readonly state = inject(PageState);
  private readonly dialog = inject(MatDialog);
  private readonly title = inject(Title);
  readonly page = signal<Page | null>(null);
  readonly busy = computed(() => this.state.running().size > 0);
  readonly total = computed(() => this.codes(this.page()?.blocks ?? []).length);
  readonly runnable = computed(() => this.codes(this.page()?.blocks ?? []).filter((c) => c.run).length);

  @Input() set name(v: string) {
    this.page.set(null);
    this.state.name.set(v);
    this.store.page(v).then((p) => {
      this.page.set(p);
      this.title.setTitle(`${p.title} - Bun × Material 3`);
      this.state.runs.set(new Map(p.runs.map((r) => [r.id, r])));
    });
  }
  private codes(bs: Block[]): Extract<Block, { t: "code" }>[] {
    return bs.flatMap((b) => (b.t === "code" ? [b] : b.t === "jsx" ? this.codes(b.children) : []));
  }
  async runPage() {
    for (const c of this.codes(this.page()?.blocks ?? []).filter((c) => c.run)) await this.state.run(c.id);
  }
  async showSkill(p: Page) {
    const md = await (await fetch(`/api/skills/${encodeURIComponent(p.name)}`)).text();
    this.dialog.open(SkillDialog, { data: md, width: "720px" });
  }
}
