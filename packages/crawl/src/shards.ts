/**
 * Search shards: a bun:sqlite database per shard (WAL) with an FTS5 index ranked by BM25, and content hashes to skip
 * unchanged documents. A shard is any name the caller chooses; how shards map to hosts is the caller's concern.
 */
import { Database } from "bun:sqlite";

export type ShardId = string;

export interface IndexedWebDocument {
  url: string;
  title: string;
  description: string;
  headings: string[];
  body: string;
  domain: string;
  category: string;
  shard: ShardId;
  qualityScore: number;
  crawledAt: number;
  contentHash?: string;
}

export interface ShardSearchHit {
  url: string;
  title: string;
  snippet: string;
  domain: string;
  category: IndexedWebDocument["category"];
  shard: ShardId;
  bm25Score: number;
  qualityScore: number;
  crawledAt: number;
}

export function contentHash(
  url: string,
  title: string,
  body: string,
): string {
  const hasher = new Bun.CryptoHasher("blake2b256");
  hasher.update(`${url}\n${title}\n${body}`);
  return hasher.digest("hex");
}

function sanitizeFts5Query(rawQuery: string): string {
  const tokens = rawQuery
    .toLowerCase()
    .replace(/[^\p{L}\p{N}_.-]+/gu, " ")
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 0)
    .slice(0, 12);
  if (tokens.length === 0) return "";
  return tokens.map((tok) => `"${tok.replace(/"/g, "")}"*`).join(" OR ");
}

export class SearchShard {
  readonly shardId: ShardId;
  readonly db: Database;

  constructor(shardId: ShardId, dbPath = ":memory:") {
    this.shardId = shardId;
    this.db = new Database(dbPath, { create: true });
    this.db.exec("PRAGMA journal_mode = WAL;");
    this.db.exec("PRAGMA synchronous = NORMAL;");
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS documents (
        url TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        headings_json TEXT NOT NULL,
        body TEXT NOT NULL,
        domain TEXT NOT NULL,
        category TEXT NOT NULL,
        shard TEXT NOT NULL,
        quality_score REAL NOT NULL DEFAULT 1.0,
        crawled_at INTEGER NOT NULL,
        content_hash TEXT NOT NULL
      );

      CREATE VIRTUAL TABLE IF NOT EXISTS search_fts USING fts5(
        url UNINDEXED,
        title,
        description,
        headings,
        body,
        domain,
        tokenize = 'unicode61 remove_diacritics 2'
      );
    `);
  }

  upsertDocument(doc: IndexedWebDocument): { hash: string; updated: boolean } {
    const hash =
      doc.contentHash ?? contentHash(doc.url, doc.title, doc.body);
    const existing = this.db
      .query<{ content_hash: string }, [string]>(
        "SELECT content_hash FROM documents WHERE url = ?1",
      )
      .get(doc.url);

    if (existing && existing.content_hash === hash) {
      return { hash, updated: false };
    }

    const headingsText = doc.headings.join(" | ");
    const tx = this.db.transaction(() => {
      this.db.query("DELETE FROM search_fts WHERE url = ?1").run(doc.url);

      this.db
        .query(
          `INSERT INTO documents (
            url, title, description, headings_json, body, domain, category, shard, quality_score, crawled_at, content_hash
          ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)
          ON CONFLICT(url) DO UPDATE SET
            title = excluded.title,
            description = excluded.description,
            headings_json = excluded.headings_json,
            body = excluded.body,
            domain = excluded.domain,
            category = excluded.category,
            shard = excluded.shard,
            quality_score = excluded.quality_score,
            crawled_at = excluded.crawled_at,
            content_hash = excluded.content_hash`,
        )
        .run(
          doc.url,
          doc.title,
          doc.description,
          JSON.stringify(doc.headings),
          doc.body,
          doc.domain,
          doc.category,
          this.shardId,
          doc.qualityScore,
          doc.crawledAt,
          hash,
        );

      this.db
        .query(
          `INSERT INTO search_fts (url, title, description, headings, body, domain)
           VALUES (?1, ?2, ?3, ?4, ?5, ?6)`,
        )
        .run(
          doc.url,
          doc.title,
          doc.description,
          headingsText,
          doc.body,
          doc.domain,
        );
    });
    tx();
    return { hash, updated: true };
  }

  search(rawQuery: string, limit = 10): ShardSearchHit[] {
    const ftsQuery = sanitizeFts5Query(rawQuery);
    if (!ftsQuery) {
      return this.db
        .query<
          {
            url: string;
            title: string;
            description: string;
            domain: string;
            category: IndexedWebDocument["category"];
            shard: ShardId;
            quality_score: number;
            crawled_at: number;
          },
          [number]
        >(
          `SELECT url, title, description, domain, category, shard, quality_score, crawled_at
           FROM documents
           ORDER BY quality_score DESC, crawled_at DESC
           LIMIT ?1`,
        )
        .all(limit)
        .map((r) => ({
          url: r.url,
          title: r.title,
          snippet: r.description,
          domain: r.domain,
          category: r.category,
          shard: r.shard,
          bm25Score: r.quality_score,
          qualityScore: r.quality_score,
          crawledAt: r.crawled_at,
        }));
    }

    const rows = this.db
      .query<
        {
          url: string;
          title: string;
          snippet_text: string;
          description: string;
          domain: string;
          category: IndexedWebDocument["category"];
          shard: ShardId;
          raw_bm25: number;
          quality_score: number;
          crawled_at: number;
        },
        [string, number]
      >(
        `SELECT
           d.url,
           d.title,
           snippet(search_fts, 4, '[', ']', ' … ', 24) AS snippet_text,
           d.description,
           d.domain,
           d.category,
           d.shard,
           bm25(search_fts, 0.0, 8.0, 4.0, 3.0, 1.5, 2.0) AS raw_bm25,
           d.quality_score,
           d.crawled_at
         FROM search_fts
         JOIN documents d ON d.url = search_fts.url
         WHERE search_fts MATCH ?1
         ORDER BY (bm25(search_fts, 0.0, 8.0, 4.0, 3.0, 1.5, 2.0) * d.quality_score) ASC
         LIMIT ?2`,
      )
      .all(ftsQuery, limit);

    return rows.map((r) => ({
      url: r.url,
      title: r.title,
      snippet: r.snippet_text || r.description,
      domain: r.domain,
      category: r.category,
      shard: r.shard,
      bm25Score:
        Math.round(Math.abs(r.raw_bm25) * r.quality_score * 1000) / 1000,
      qualityScore: r.quality_score,
      crawledAt: r.crawled_at,
    }));
  }

  suggest(prefix: string, limit = 6): string[] {
    const clean = prefix.trim().toLowerCase();
    const out = new Set<string>();


    const rows = this.db
      .query<{ title: string }, [string, number]>(
        `SELECT title FROM documents WHERE lower(title) LIKE ?1 ORDER BY quality_score DESC LIMIT ?2`,
      )
      .all(`%${clean}%`, limit);

    for (const r of rows) {
      out.add(r.title);
      if (out.size >= limit) break;
    }
    return [...out];
  }

  count(): number {
    const row = this.db
      .query<{ c: number }, []>("SELECT COUNT(*) AS c FROM documents")
      .get();
    return row?.c ?? 0;
  }

  close(): void {
    this.db.close();
  }
}
