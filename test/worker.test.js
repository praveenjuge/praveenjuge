import { describe, test } from "node:test";
import assert from "node:assert/strict";
import worker, {
  addAcceptToVary,
  prefersMarkdown,
} from "../worker.js";

const browserAccept =
  "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8";

describe("prefersMarkdown", () => {
  test("accepts a plain Markdown request", () => {
    assert.equal(prefersMarkdown("text/markdown"), true);
  });

  test("rejects a normal browser Accept header", () => {
    assert.equal(prefersMarkdown(browserAccept), false);
  });

  test("rejects a wildcard-only Accept header", () => {
    assert.equal(prefersMarkdown("*/*"), false);
  });

  test("rejects a missing Accept header", () => {
    assert.equal(prefersMarkdown(null), false);
  });

  test("rejects Markdown with a zero quality value", () => {
    assert.equal(prefersMarkdown("text/markdown;q=0"), false);
  });

  test("honors HTML preferred with a higher quality value", () => {
    assert.equal(prefersMarkdown("text/markdown;q=0.5, text/html;q=1"), false);
  });

  test("accepts Markdown preferred over HTML", () => {
    assert.equal(prefersMarkdown("text/markdown, text/html;q=0.9"), true);
  });

  test("prefers the most specific range over a wildcard", () => {
    assert.equal(
      prefersMarkdown("text/markdown;q=0.8, text/html;q=0, */*;q=1"),
      true,
    );
  });
});

describe("addAcceptToVary", () => {
  test("adds Accept when Vary is missing", () => {
    assert.equal(addAcceptToVary(null), "Accept");
  });

  test("preserves existing values", () => {
    assert.equal(addAcceptToVary("Origin"), "Origin, Accept");
  });

  test("does not duplicate Accept with different casing", () => {
    assert.equal(addAcceptToVary("Origin, accept"), "Origin, accept");
  });

  test("keeps a wildcard Vary unchanged", () => {
    assert.equal(addAcceptToVary("*"), "*");
  });
});

describe("worker fetch", () => {
  const htmlResponse = new Response("<html>home</html>", {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
  const llmsResponse = new Response("# Praveen Juge\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });

  const env = {
    ASSETS: {
      async fetch(request) {
        return new URL(request.url).pathname === "/llms.txt"
          ? llmsResponse.clone()
          : htmlResponse.clone();
      },
    },
  };

  function request(accept, method = "GET", path = "/") {
    return new Request(`https://praveenjuge.com${path}`, {
      method,
      headers: { Accept: accept },
    });
  }

  test("serves Markdown for the homepage", async () => {
    const response = await worker.fetch(request("text/markdown"), env);

    assert.equal(response.status, 200);
    assert.equal(
      response.headers.get("Content-Type"),
      "text/markdown; charset=utf-8",
    );
    assert.equal(response.headers.get("Vary"), "Accept");
    assert.equal(await response.text(), "# Praveen Juge\n");
  });

  test("keeps serving HTML with Vary: Accept for browsers", async () => {
    const response = await worker.fetch(request(browserAccept), env);

    assert.equal(response.status, 200);
    assert.match(response.headers.get("Content-Type"), /^text\/html/);
    assert.equal(response.headers.get("Vary"), "Accept");
    assert.equal(await response.text(), "<html>home</html>");
  });

  test("answers HEAD requests with headers only", async () => {
    const response = await worker.fetch(request("text/markdown", "HEAD"), env);

    assert.equal(response.status, 200);
    assert.equal(await response.text(), "");
  });

  test("does not intercept non-GET methods", async () => {
    const response = await worker.fetch(request("text/markdown", "POST"), env);

    assert.match(response.headers.get("Content-Type"), /^text\/html/);
  });

  test("serves HTML for other paths with a Markdown request", async () => {
    const response = await worker.fetch(
      request("text/markdown", "GET", "/blog/"),
      env,
    );

    assert.match(response.headers.get("Content-Type"), /^text\/html/);
  });
});
