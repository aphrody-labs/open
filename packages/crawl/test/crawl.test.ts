import { describe, expect, test } from "bun:test";
import { parseRobotsTxt } from "../src/crawler.ts";
import { contentHash, SearchShard } from "../src/shards.ts";

describe("robots.txt", () => {
  test("the agent's own group wins over the wildcard group", () => {
    const rules = parseRobotsTxt("User-agent: *\nDisallow: /\n\nUser-agent: examplebot\nAllow: /docs\nDisallow: /private\n", "examplebot");
    expect(rules.allow).toContain("/docs");
    expect(rules.disallow).toContain("/private");
    expect(rules.disallow).not.toContain("/");
  });
  test("an unknown agent falls back to the wildcard group", () => {
    expect(parseRobotsTxt("User-agent: *\nDisallow: /tmp\n", "otherbot").disallow).toEqual(["/tmp"]);
  });
});

describe("search shard", () => {
  const doc = (url: string, title: string, body: string) => ({ url, title, description: "", headings: [], body, domain: new URL(url).hostname, category: "docs", shard: "a", qualityScore: 1, crawledAt: 1 });
  test("indexes, ranks by BM25 and skips unchanged content", () => {
    const s = new SearchShard("a");
    expect(s.upsertDocument(doc("https://example.org/a", "Bun shell", "Bun.$ runs shell commands")).updated).toBe(true);
    s.upsertDocument(doc("https://example.org/b", "SQLite", "bun:sqlite opens databases"));
    expect(s.upsertDocument(doc("https://example.org/a", "Bun shell", "Bun.$ runs shell commands")).updated).toBe(false);
    const hits = s.search("shell");
    expect(hits[0]?.url).toBe("https://example.org/a");
    expect(s.count()).toBe(2);
    s.close();
  });
  test("content hash is stable and content-addressed", () => {
    expect(contentHash("u", "t", "b")).toBe(contentHash("u", "t", "b"));
    expect(contentHash("u", "t", "b")).not.toBe(contentHash("u", "t", "c"));
  });
});
