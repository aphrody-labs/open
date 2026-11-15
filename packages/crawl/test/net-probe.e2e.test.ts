// e2e:auth — needs the owner's logged-in Chrome reachable over CDP (APHRODY_CDP_URL,
// e.g. http://127.0.0.1:9222 for a Chrome started with --remote-debugging-port and
// --user-data-dir=$APHRODY_CHROME_PROFILE). Skipped cleanly otherwise. Run on the PC.
import { describe, expect, test } from "bun:test";
import { probe } from "../src/net/probe.ts";
import {
  ChromiumBunCdpClient,
  networkTimingFromResponse,
} from "../src/browser/cdp-client.ts";
import targets from "./targets.json";

const CDP = process.env.APHRODY_CDP_URL;
const T = targets.gemini;

describe.skipIf(!CDP)("e2e:auth gemini", () => {
  test("authenticated load, prompt, streamed model response, h2/h3 + TLS 1.3", async () => {
    const cdp = await ChromiumBunCdpClient.connect({ endpoint: CDP! });
    const events: { method: string; params: Record<string, any> }[] = [];
    const targetId = await cdp.createTarget("about:blank");
    try {
      await cdp.attachToTarget(targetId);
      for (const method of [
        "Network.responseReceived",
        "Network.webSocketCreated",
        "Network.dataReceived",
      ])
        cdp.on(method, (params) => events.push({ method, params }));
      await cdp.send("Network.enable");
      await cdp.send("Page.enable");
      await cdp.send("Page.navigate", { url: T.url });
      const page = {
        evaluate: (expr: string) => cdp.evaluate(expr),
        events,
        send: (m: string, p?: Record<string, unknown>) => cdp.send(m, p),
      };
      const until = async (expr: string, ms = 30_000) => {
        const end = Date.now() + ms;
        while (Date.now() < end) {
          if (await page.evaluate(expr)) return true;
          await Bun.sleep(250);
        }
        return false;
      };
      expect(
        await until(
          `!!document.querySelector(${JSON.stringify(T.avatar_selector)})`,
        ),
      ).toBe(true);
      const doc = page.events.find(
        (e) =>
          e.method === "Network.responseReceived" &&
          e.params.type === "Document",
      );
      const chrome = networkTimingFromResponse(doc!.params);
      expect(["h2", "h3"]).toContain(chrome.protocol);
      expect(chrome.tls).toBe("TLS 1.3");

      const before = page.events.length;
      await page.evaluate(`(() => { const el = document.querySelector(${JSON.stringify(T.prompt_selector)});
        el.focus(); document.execCommand("insertText", false, ${JSON.stringify(T.prompt)}); return true })()`);
      await page.send("Input.dispatchKeyEvent", {
        type: "keyDown",
        key: "Enter",
        code: "Enter",
        windowsVirtualKeyCode: 13,
      });
      expect(
        await until(
          `(document.querySelector(${JSON.stringify(T.response_selector)})?.innerText ?? "").length > 0`,
          90_000,
        ),
      ).toBe(true);
      const stream = page.events
        .slice(before)
        .some(
          (e) =>
            e.method === "Network.webSocketCreated" ||
            e.method === "Network.dataReceived" ||
            (e.method === "Network.responseReceived" &&
              /StreamGenerate|batchexecute/.test(e.params.response.url)),
        );
      expect(stream).toBe(true);

      // Same load through src/net: protocol family and TLS must match Chrome.
      if (process.env.APHRODY_NET_LIB) {
        const ours = probe(T.url);
        expect(ours.tls_version).toBe("TLSv1_3");
        expect(ours.alt_svc ?? "").toContain("h3");
        console.log(JSON.stringify({ chrome, ours }, null, 2));
      }
    } finally {
      await cdp.closeTarget(targetId).catch(() => false);
      await cdp.close();
    }
  }, 180_000);
});
