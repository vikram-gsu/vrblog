import { beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { GET, POST } from "../api/whatsapp.ts";
import { readEntries, todayIn } from "../api/_lib/bot.ts";

const SECRET = "app-secret";
const ME = "14045550100";
const read = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

// In-memory GitHub repo plus captured WhatsApp replies.
let files: Record<string, string>;
let commits: string[];
let replies: { to: string; body: string }[];

beforeEach(() => {
  files = {
    "content/tracker/plan.yaml": read("content/tracker/plan.yaml"),
    "content/tracker/agenda.yaml": read("content/tracker/agenda.yaml"),
    "content/tracker/log.yaml": read("content/tracker/log.yaml"),
  };
  commits = [];
  replies = [];
  Object.assign(process.env, {
    WHATSAPP_APP_SECRET: SECRET,
    WHATSAPP_VERIFY_TOKEN: "verify-me",
    WHATSAPP_ALLOWED_FROM: "+1 (404) 555-0100",
    WHATSAPP_PHONE_NUMBER_ID: "123",
    WHATSAPP_ACCESS_TOKEN: "wa-token",
    GITHUB_TOKEN: "gh-token",
  });

  globalThis.fetch = async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = new URL(String(input));
    if (url.host === "graph.facebook.com") {
      const body = JSON.parse(String(init.body));
      replies.push({ to: body.to, body: body.text.body });
      return new Response("{}");
    }
    const contents = url.pathname.match(/\/contents\/(.+)$/);
    if (contents) {
      const path = decodeURIComponent(contents[1]);
      if (init.method === "PUT") {
        const body = JSON.parse(String(init.body));
        files[path] = Buffer.from(body.content, "base64").toString("utf8");
        commits.unshift(body.message);
        return new Response("{}");
      }
      const content = Buffer.from(files[path]).toString("base64");
      return Response.json({ content, sha: "sha" });
    }
    if (url.pathname.endsWith("/commits")) {
      return Response.json(commits.map((message) => ({ commit: { message } })));
    }
    throw new Error(`unexpected fetch ${url}`);
  };
});

function webhook(text: string, { from = ME, id = `wamid.${Math.random()}`, secret = SECRET } = {}) {
  const body = JSON.stringify({
    entry: [{ changes: [{ value: { messages: [{ id, from, type: "text", text: { body: text } }] } }] }],
  });
  const sig = "sha256=" + createHmac("sha256", secret).update(body).digest("hex");
  return new Request("https://example.com/api/whatsapp", {
    method: "POST",
    body,
    headers: { "x-hub-signature-256": sig },
  });
}

const log = () => readEntries(files["content/tracker/log.yaml"]);
const today = () => todayIn("America/New_York");

test("verification handshake", () => {
  const ok = GET(new Request("https://x/api/whatsapp?hub.mode=subscribe&hub.verify_token=verify-me&hub.challenge=42"));
  assert.equal(ok.status, 200);
  const bad = GET(new Request("https://x/api/whatsapp?hub.mode=subscribe&hub.verify_token=nope&hub.challenge=42"));
  assert.equal(bad.status, 403);
});

test("rejects a bad signature", async () => {
  const res = await POST(webhook("ddia 30", { secret: "wrong" }));
  assert.equal(res.status, 401);
  assert.deepEqual(log(), []);
});

test("ignores numbers other than mine", async () => {
  const res = await POST(webhook("ddia 30", { from: "15550001111" }));
  assert.equal(res.status, 200);
  assert.deepEqual(log(), []);
  assert.deepEqual(replies, []);
});

test("logs a session, commits, and replies", async () => {
  await POST(webhook("ddia 45 ch8", { id: "wamid.A" }));
  assert.deepEqual(log(), [{ date: today(), task: "ddia", minutes: 45, note: "ch8" }]);
  assert.match(commits[0], /wamid\.A/);
  assert.equal(replies.length, 1);
  assert.match(replies[0].body, /✅ Designing Data-Intensive Applications · 45 min · "ch8"/);
});

test("a retried delivery is not logged twice", async () => {
  await POST(webhook("lc 30", { id: "wamid.B" }));
  await POST(webhook("lc 30", { id: "wamid.B" }));
  assert.equal(log().length, 1);
  assert.equal(replies.length, 1);
});

test("undo and today", async () => {
  await POST(webhook("lc 30\nllm 1h"));
  await POST(webhook("undo"));
  assert.deepEqual(log().map((e) => e.task), ["leetcode"]);
  assert.match(replies.at(-1)!.body, /Removed: .*Build a Large Language Model/);

  await POST(webhook("?"));
  assert.match(replies.at(-1)!.body, /done/);
});

test("unknown input gets help and logs nothing", async () => {
  await POST(webhook("went for a run"));
  assert.deepEqual(log(), []);
  assert.match(replies[0].body, /Didn't understand "went for a run"/);
});
