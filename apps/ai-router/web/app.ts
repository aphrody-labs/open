import { Component, ElementRef, ViewChild, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatBottomSheet, MatBottomSheetModule, MAT_BOTTOM_SHEET_DATA } from "@angular/material/bottom-sheet";
import { MatButtonModule } from "@angular/material/button";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatCardModule } from "@angular/material/card";
import { MatChipsModule } from "@angular/material/chips";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatListModule } from "@angular/material/list";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatTooltipModule } from "@angular/material/tooltip";

type Turn = { role: "user" | "assistant"; text: string; offer?: string; attempts?: number; error?: string };
type Offer = { provider: string; model: string; local: boolean; cost_in: number; cost_out: number; context: number };

@Component({
  selector: "app-offers",
  imports: [MatBottomSheetModule, MatListModule, MatIconModule],
  template: `
    <h2 class="t">{{ data.offers.length }} offers for {{ data.policy }}, in the order they are tried</h2>
    <mat-list>
      @for (o of data.offers.slice(0, 200); track o.provider + o.model) {
        <mat-list-item>
          <mat-icon matListItemIcon>{{ o.local ? "computer" : o.cost_in + o.cost_out === 0 ? "money_off" : "paid" }}</mat-icon>
          <span matListItemTitle>{{ o.provider }}/{{ o.model }}</span>
          <span matListItemLine>{{ o.local ? "local" : o.cost_in + o.cost_out === 0 ? "zero cost" : usd.format(o.cost_in) + " / " + usd.format(o.cost_out) + " per million tokens" }}</span>
        </mat-list-item>
      }
    </mat-list>
  `,
  styles: `.t { font: var(--mat-sys-title-medium); margin: 16px; }`,
})
export class Offers {
  readonly data = inject<{ policy: string; offers: Offer[] }>(MAT_BOTTOM_SHEET_DATA);
  readonly usd = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 6 });
}

@Component({
  selector: "app-root",
  imports: [FormsModule, MatBottomSheetModule, MatButtonModule, MatButtonToggleModule, MatCardModule, MatChipsModule, MatFormFieldModule, MatIconModule, MatInputModule, MatProgressBarModule, MatToolbarModule, MatTooltipModule],
  template: `
    <header>
    <mat-toolbar class="bar">
      <mat-icon>hub</mat-icon>
      <span class="title">ai-router</span>
      <span class="grow"></span>
      <button matIconButton (click)="showOffers()" matTooltip="Offers" aria-label="Offers"><mat-icon>format_list_bulleted</mat-icon></button>
    </mat-toolbar>
    <div class="progress">
      @if (busy()) {
        <mat-progress-bar mode="indeterminate" aria-label="Answering" />
      }
    </div>
    </header>
    <main #log class="log" aria-live="polite">
      @for (t of turns(); track $index) {
        <mat-card [appearance]="t.role === 'user' ? 'filled' : 'outlined'" class="turn" [class.user]="t.role === 'user'">
          <mat-card-content><p class="text">{{ t.text || (t.role === "assistant" && !t.error ? "…" : "") }}</p></mat-card-content>
          @if (t.offer || t.error) {
            <mat-card-footer class="meta">
              <mat-chip-set aria-label="Route">
                @if (t.offer) { <mat-chip><mat-icon matChipAvatar>route</mat-icon>{{ t.offer }}</mat-chip> }
                @if (t.attempts) { <mat-chip>{{ t.attempts }} attempt(s)</mat-chip> }
                @if (t.error) { <mat-chip class="err"><mat-icon matChipAvatar>error</mat-icon>{{ t.error }}</mat-chip> }
              </mat-chip-set>
            </mat-card-footer>
          }
        </mat-card>
      } @empty {
        <p class="hint">Local models first, then zero-cost offers, then the cheapest, with failover between them.</p>
      }
    </main>
    <footer class="composer">
      <mat-button-toggle-group [(ngModel)]="policy" aria-label="Policy" class="policy" hideSingleSelectionIndicator>
        @for (p of policies; track p.value) { <mat-button-toggle [value]="p.value" [matTooltip]="p.hint">{{ p.label }}</mat-button-toggle> }
      </mat-button-toggle-group>
      <div class="row">
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="input">
          <mat-label>Message</mat-label>
          <textarea matInput [(ngModel)]="draft" (keydown.enter)="send($event)" cdkTextareaAutosize rows="1"></textarea>
        </mat-form-field>
        <button matFab (click)="send()" [disabled]="busy() || !draft.trim()" aria-label="Send"><mat-icon>send</mat-icon></button>
      </div>
    </footer>
  `,
  styles: `
    :host { display: grid; grid-template-rows: auto 1fr auto; height: 100dvh; }
    .progress { height: 4px; }
    .bar { gap: 8px; background: var(--mat-sys-surface-container); }
    .title { font: var(--mat-sys-title-large); }
    .grow { flex: 1; }
    .log { overflow: auto; padding: 16px; display: grid; gap: 12px; align-content: start; max-width: 900px; width: 100%; margin-inline: auto; box-sizing: border-box; }
    .turn { max-width: 85%; }
    .turn.user { justify-self: end; }
    .text { white-space: pre-wrap; margin: 0; }
    .meta { padding: 0 16px 12px; }
    .err { --mat-chip-label-text-color: var(--mat-sys-error); }
    .hint { color: var(--mat-sys-on-surface-variant); text-align: center; margin-top: 20vh; }
    .composer { padding: 8px 16px 16px; display: grid; gap: 8px; max-width: 900px; width: 100%; margin-inline: auto; box-sizing: border-box; }
    .row { display: flex; gap: 12px; align-items: center; }
    .input { flex: 1; }
    .policy { justify-self: start; }
  `,
})
export class App {
  private readonly sheet = inject(MatBottomSheet);
  @ViewChild("log") log?: ElementRef<HTMLElement>;
  readonly policies = [
    { value: "auto", label: "Auto", hint: "local, then zero cost, then cheapest" },
    { value: "auto:local", label: "Local", hint: "models running on this machine" },
    { value: "auto:free", label: "Free", hint: "local and zero-cost offers" },
    { value: "auto:cheap", label: "Paid", hint: "paid offers, cheapest first" },
  ];
  policy = "auto";
  draft = "";
  readonly turns = signal<Turn[]>([]);
  readonly busy = signal(false);
  readonly count = computed(() => this.turns().length);

  async showOffers() {
    const offers: Offer[] = await (await fetch(`/api/models?policy=${encodeURIComponent(this.policy)}`)).json();
    this.sheet.open(Offers, { data: { policy: this.policy, offers } });
  }

  private patchLast(fn: (t: Turn) => Turn) {
    this.turns.update((ts) => [...ts.slice(0, -1), fn(ts.at(-1)!)]);
    queueMicrotask(() => this.log?.nativeElement.scrollTo({ top: this.log.nativeElement.scrollHeight }));
  }

  async send(e?: Event) {
    if (e instanceof KeyboardEvent && e.shiftKey) return;
    e?.preventDefault();
    const text = this.draft.trim();
    if (!text || this.busy()) return;
    this.draft = "";
    this.turns.update((ts) => [...ts, { role: "user", text }, { role: "assistant", text: "" }]);
    this.busy.set(true);
    const messages = this.turns().slice(0, -1).map((t) => ({ role: t.role, content: t.text }));
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ model: this.policy, messages }) });
      const reader = res.body!.pipeThrough(new TextDecoderStream()).getReader();
      let buf = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += value;
        let i: number;
        while ((i = buf.indexOf("\n\n")) >= 0) {
          const event = buf.slice(0, i);
          buf = buf.slice(i + 2);
          const data = event.split("\n").find((l) => l.startsWith("data: "))?.slice(6);
          if (!data) continue;
          const json = JSON.parse(data);
          if (event.startsWith("event: router")) {
            this.patchLast((t) => ({ ...t, offer: json.router?.offer, attempts: json.router?.attempts?.length, error: json.error?.message }));
          } else {
            const delta = json.choices?.[0]?.delta?.content ?? "";
            if (delta) this.patchLast((t) => ({ ...t, text: t.text + delta }));
          }
        }
      }
    } catch (err) {
      this.patchLast((t) => ({ ...t, error: String(err) }));
    } finally {
      this.busy.set(false);
    }
  }
}
