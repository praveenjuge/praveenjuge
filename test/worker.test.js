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
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      ETag: '"abc123"',
      "Cache-Control": "public, max-age=300",
      "Content-Length": "16",
      "Last-Modified": "Sat, 26 Sep 2026 00:00:00 GMT",
    },
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

  test("preserves the source asset's caching metadata", async () => {
    const response = await worker.fetch(request("text/markdown"), env);

    assert.equal(response.headers.get("ETag"), '"abc123"');
    assert.equal(response.headers.get("Cache-Control"), "public, max-age=300");
    assert.equal(response.headers.get("Content-Length"), "16");
    assert.equal(
      response.headers.get("Last-Modified"),
      "Sat, 26 Sep 2026 00:00:00 GMT",
    );
    assert.equal(response.headers.get("Vary"), "Accept");
  });

  test("forwards validators and returns a Markdown 304", async () => {
    const conditionalEnv = {
      ASSETS: {
        async fetch(request) {
          assert.equal(new URL(request.url).pathname, "/llms.txt");
          assert.equal(request.headers.get("If-None-Match"), '"abc123"');
          return new Response(null, {
            status: 304,
            headers: { ETag: '"abc123"' },
          });
        },
      },
    };
    const conditionalRequest = new Request("https://praveenjuge.com/", {
      headers: {
        Accept: "text/markdown",
        "If-None-Match": '"abc123"',
      },
    });

    const response = await worker.fetch(conditionalRequest, conditionalEnv);

    assert.equal(response.status, 304);
    assert.equal(response.headers.get("ETag"), '"abc123"');
    assert.equal(response.headers.get("Vary"), "Accept");
    assert.equal(await response.text(), "");
  });

  test("answers HEAD requests with headers only", async () => {
    const response = await worker.fetch(request("text/markdown", "HEAD"), env);

    assert.equal(response.status, 200);
    assert.equal(
      response.headers.get("Content-Type"),
      "text/markdown; charset=utf-8",
    );
    assert.equal(response.headers.get("Vary"), "Accept");
    assert.equal(await response.text(), "");
  });

  test("serves Markdown for the /index.html homepage alias", async () => {
    const response = await worker.fetch(
      request("text/markdown", "GET", "/index.html"),
      env,
    );

    assert.equal(
      response.headers.get("Content-Type"),
      "text/markdown; charset=utf-8",
    );
    assert.equal(await response.text(), "# Praveen Juge\n");
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

  test("merges Accept into an existing Vary header on HTML", async () => {
    const varyEnv = {
      ASSETS: {
        async fetch() {
          return new Response("<html>vary</html>", {
            headers: {
              "Content-Type": "TEXT/HTML; charset=utf-8",
              Vary: "Origin",
            },
          });
        },
      },
    };

    const response = await worker.fetch(request(browserAccept), varyEnv);

    assert.equal(response.headers.get("Vary"), "Origin, Accept");
  });
});


describe("Markdown 404 negotiation", () => {
  const markdownNotFound = "# Page not found (404)\n\n- [Site guide](https://praveenjuge.com/llms.txt)\n";

  /** Returns an asset binding with a configurable upstream error response. */
  function missingEnv(status = 404, contentType = "text/html; charset=utf-8", vary = "Origin", hasMarkdown = true) {
    return {
      ASSETS: {
        async fetch(request) {
          if (new URL(request.url).pathname === "/404.md") {
            // A plain GET, never the original request's method or validators.
            assert.equal(request.method, "GET");
            assert.equal(request.headers.get("If-None-Match"), null);
            return hasMarkdown
              ? new Response(markdownNotFound, {
                  headers: {
                    "Content-Type": "text/markdown",
                    "Content-Length": String(new TextEncoder().encode(markdownNotFound).length),
                    ETag: '"md-404"',
                  },
                })
              : new Response("<html>missing</html>", { status: 404, headers: { "Content-Type": "text/html" } });
          }

          return new Response("<html>missing</html>", {
            status,
            headers: {
              "Content-Type": contentType,
              "Content-Length": "20",
              "Content-Encoding": "gzip",
              ETag: '"html-404"',
              "Last-Modified": "Sat, 26 Sep 2026 00:00:00 GMT",
              "Content-Range": "bytes 0-19/20",
              "Accept-Ranges": "bytes",
              "Content-MD5": "html-digest",
              Digest: "sha-256=html-digest",
              "Content-Digest": "sha-256=:html-digest:",
              "Repr-Digest": "sha-256=:html-digest:",
              "Cache-Control": "public, max-age=0, must-revalidate",
              "X-Content-Type-Options": "nosniff",
              Vary: vary,
            },
          });
        },
      },
    };
  }

  /** Makes a request for a missing page on a preview origin. */
  function request(accept, method = "GET", headers = {}) {
    return new Request("https://preview.example/__missing?query=ignored", {
      method,
      headers: { Accept: accept, ...headers },
    });
  }

  test("serves the built /404.md page with a real 404 status", async () => {
    const response = await worker.fetch(request("text/markdown", "GET", { "If-None-Match": '"html-404"' }), missingEnv());
    assert.equal(response.status, 404);
    assert.equal(response.headers.get("Content-Type"), "text/markdown; charset=utf-8");
    assert.equal(response.headers.get("Vary"), "Origin, Accept");
    const body = await response.text();
    assert.equal(body, markdownNotFound);
    assert.equal(Number(response.headers.get("Content-Length")), new TextEncoder().encode(body).length);
  });

  test("falls back to the HTML 404 with Vary: Accept when /404.md is missing", async () => {
    const response = await worker.fetch(request("text/markdown"), missingEnv(404, "text/html; charset=utf-8", "Origin", false));
    assert.equal(response.status, 404);
    assert.match(response.headers.get("Content-Type"), /^text\/html/);
    assert.equal(response.headers.get("Vary"), "Origin, Accept");
    assert.equal(await response.text(), "<html>missing</html>");
  });

  test("drops stale HTML validators, encoding, and ranges while preserving cache and security headers", async () => {
    const response = await worker.fetch(request("text/markdown"), missingEnv());
    for (const name of ["ETag", "Last-Modified", "Content-Encoding", "Content-Range", "Accept-Ranges", "Content-MD5", "Digest", "Content-Digest", "Repr-Digest"]) {
      assert.equal(response.headers.get(name), null, name);
    }
    assert.equal(response.headers.get("Cache-Control"), "public, max-age=0, must-revalidate");
    assert.equal(response.headers.get("X-Content-Type-Options"), "nosniff");
  });

  test("HEAD has the same status and representation headers without a body", async () => {
    const get = await worker.fetch(request("text/markdown"), missingEnv());
    const head = await worker.fetch(request("text/markdown", "HEAD"), missingEnv());
    assert.equal(head.status, 404);
    assert.deepEqual([...head.headers], [...get.headers]);
    assert.equal(await head.text(), "");
  });

  test("preserves wildcard Vary", async () => {
    const response = await worker.fetch(request("text/markdown"), missingEnv(404, "text/html", "*"));
    assert.equal(response.headers.get("Vary"), "*");
  });

  for (const accept of [browserAccept, "*/*", "text/markdown;q=0", "text/markdown;q=0.5, text/html;q=1"]) {
    test(`keeps the HTML 404 for ${accept}`, async () => {
      const response = await worker.fetch(request(accept), missingEnv());
      assert.equal(response.status, 404);
      assert.match(response.headers.get("Content-Type"), /^text\/html/);
      assert.equal(await response.text(), "<html>missing</html>");
    });
  }

  test("does not replace non-GET requests", async () => {
    const response = await worker.fetch(request("text/markdown", "POST"), missingEnv());
    assert.equal(response.status, 404);
    assert.match(response.headers.get("Content-Type"), /^text\/html/);
  });

  for (const status of [200, 403, 500]) {
    test(`does not replace an HTML ${status}`, async () => {
      const response = await worker.fetch(request("text/markdown"), missingEnv(status));
      assert.equal(response.status, status);
      assert.equal(await response.text(), "<html>missing</html>");
    });
  }

  test("preserves non-HTML 404 responses", async () => {
    const response = await worker.fetch(request("text/markdown"), missingEnv(404, "application/json"));
    assert.equal(response.status, 404);
    assert.equal(response.headers.get("Content-Type"), "application/json");
    assert.equal(response.headers.get("Vary"), "Origin");
    assert.equal(await response.text(), "<html>missing</html>");
  });
  for (const type of ["text/htmlish", "text/html+custom", "text/plain"]) {
    test(`does not confuse ${type} with HTML`, async () => {
      const response = await worker.fetch(request("text/markdown"), missingEnv(404, type));
      assert.equal(response.headers.get("Content-Type"), type);
      assert.equal(response.headers.get("Vary"), "Origin");
      assert.equal(await response.text(), "<html>missing</html>");
    });
  }

  test("accepts HTML media types with mixed case, whitespace, and parameters", async () => {
    const response = await worker.fetch(request("text/markdown"), missingEnv(404, "Text/HTML ; charset=UTF-8"));
    assert.equal(response.headers.get("Content-Type"), "text/markdown; charset=utf-8");
  });

});
