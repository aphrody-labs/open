import { Injectable, computed, signal } from "@angular/core";

export type Entry = { name: string; title: string; section: string; group: string; description: string; examples: number; runnable: number };
export type Run = { skill: string; id: number; status: "pass" | "fail" | "timeout" | "skipped"; exit: number | null; ms: number; stdout: string; stderr: string; apis: string[]; reason?: string; at: string };
export type Block =
  | { t: "md"; html: string }
  | { t: "code"; id: number; lang: string; file: string | null; code: string; run: "script" | "test" | "shell" | null }
  | { t: "jsx"; name: string; attrs: Record<string, string | boolean>; children: Block[] };
export type Page = { name: string; title: string; description: string; section: string; tab: string; group: string; source: string; parser: string; blocks: Block[]; runs: Run[] };
export type Job = { total: number; done: number; started: string; counts: Record<Run["status"], number> };
export type Event = { type: "run" | "done"; skill?: string; id?: number; status?: Run["status"]; done: number; total: number };
export type Coverage = {
  bun: { version: string; revision: string; total: number; used: number; entries: { name: string; kind: string; calls: number; used: boolean }[] };
  runs: { runnable: number; executed: number; status: Partial<Record<Run["status"], number>> };
  kit: { library: unknown; componentSets: number; m3Components: number; implemented: number; components: { name: string; figma: number; angular: string | null; selector: string | null; partial: string | null; reason: string | null }[] };
};

const json = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const r = await fetch(url, init);
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json() as Promise<T>;
};

@Injectable({ providedIn: "root" })
export class Store {
  readonly index = signal<Entry[]>([]);
  readonly sources = signal<{ repo: string; branch: string; rev: string; web: string } | null>(null);
  readonly coverage = signal<Coverage | null>(null);
  readonly job = signal<Job | null>(null);
  readonly events = signal<Event[]>([]);
  readonly sections = computed(() => {
    const m = new Map<string, number>();
    for (const e of this.index()) m.set(e.section, (m.get(e.section) ?? 0) + 1);
    return [...m].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  });
  // selectors of the M3 components rendered at least once in this session (proof of use, read from the DOM)
  readonly rendered = signal<Set<string>>(new Set());

  constructor() {
    this.load();
    const es = new EventSource("/api/events");
    es.onmessage = (m) => {
      const e = JSON.parse(m.data) as Event;
      this.events.update((xs) => [e, ...xs].slice(0, 300));
      this.job.update((j) => (j ? { ...j, done: e.done, total: e.total, counts: e.type === "run" && e.status ? { ...j.counts, [e.status]: (j.counts[e.status] ?? 0) + 1 } : j.counts } : j));
      if (e.type === "done" || e.done % 50 === 0) this.refreshCoverage();
    };
  }

  async load() {
    this.index.set(await json<Entry[]>("/api/index"));
    this.sources.set(await json("/api/sources"));
    this.job.set(await json<Job | null>("/api/run-all"));
    await this.refreshCoverage();
  }
  async refreshCoverage() {
    this.coverage.set(await json<Coverage>("/api/coverage"));
  }
  page(name: string) {
    return json<Page>(`/api/pages/${encodeURIComponent(name)}`);
  }
  run(name: string, id: number) {
    return json<Run>(`/api/run/${encodeURIComponent(name)}/${id}`, { method: "POST" });
  }
  async runAll(section?: string) {
    this.job.set(await json<Job>(`/api/run-all${section ? `?section=${encodeURIComponent(section)}` : ""}`, { method: "POST" }));
  }
  markRendered(selectors: string[]) {
    const next = new Set(this.rendered());
    let changed = false;
    for (const s of selectors) if (!next.has(s) && document.querySelector(s)) (next.add(s), (changed = true));
    if (changed) this.rendered.set(next);
  }
}
