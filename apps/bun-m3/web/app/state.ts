import { Injectable, inject, signal } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Store, type Run } from "./store.ts";

// Per-page state shared by the code blocks of the page: results by example id and the run action.
@Injectable()
export class PageState {
  private readonly store = inject(Store);
  private readonly snack = inject(MatSnackBar);
  readonly name = signal("");
  readonly runs = signal(new Map<number, Run>());
  readonly running = signal(new Set<number>());
  async run(id: number) {
    this.running.update((s) => new Set(s).add(id));
    try {
      const r = await this.store.run(this.name(), id);
      this.runs.update((m) => new Map(m).set(id, r));
      this.snack.open(`Example ${id}: ${r.status} in ${Math.round(r.ms)} ms`, undefined, { duration: 2500 });
    } finally {
      this.running.update((s) => (s.delete(id), new Set(s)));
    }
  }
}
