/**
 * Worker entry: serves the Astro static assets, with Markdown content
 * negotiation (acceptmarkdown.com) on the homepage.
 *
 * The site deploys to Cloudflare as static assets. Without a Worker, a
 * request with `Accept: text/markdown` receives HTML with no `Vary: Accept`,
 * so agents cannot discover a Markdown representation and shared caches
 * cannot keep the variants apart. This Worker answers Markdown requests for
 * `/` with the site's llms.txt as its Markdown mirror and adds `Vary: Accept`
 * to HTML responses.
 */

const markdownContentType = "text/markdown; charset=utf-8";

function parseAcceptHeader(header) {
  return header
    .split(",")
    .map((part) => {
      const [type, ...params] = part.split(";");
      let q = 1;

      for (const param of params) {
        const match = param.trim().match(/^q=\s*([0-9]*\.?[0-9]+)$/i);
        if (match) {
          q = Number.parseFloat(match[1]);
        }
      }

      return { type: type.trim().toLowerCase(), q };
    })
    .filter((entry) => entry.type !== "");
}

function qualityFor(entries, type) {
  const entry = entries.find((candidate) => candidate.type === type);
  return entry?.q;
}

/**
 * True when the client explicitly accepts Markdown and does not clearly
 * prefer HTML. Plain browser Accept headers never mention Markdown, so
 * browser traffic is unaffected. The most specific matching range wins.
 */
export function prefersMarkdown(acceptHeader) {
  if (!acceptHeader) {
    return false;
  }

  const entries = parseAcceptHeader(acceptHeader);
  const markdownQ = qualityFor(entries, "text/markdown") ?? 0;

  if (markdownQ <= 0) {
    return false;
  }

  const htmlQ =
    qualityFor(entries, "text/html") ??
    qualityFor(entries, "text/*") ??
    qualityFor(entries, "*/*") ??
    0;

  return markdownQ >= htmlQ;
}

/** Adds Accept to a Vary header value without duplicating entries. */
export function addAcceptToVary(vary) {
  const values = (vary ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const normalized = new Set(values.map((value) => value.toLowerCase()));

  if (!normalized.has("*") && !normalized.has("accept")) {
    values.push("Accept");
  }

  return values.join(", ");
}

const passthroughAssetHeaders = [
  "Cache-Control",
  "Content-Length",
  "ETag",
  "Last-Modified",
];

/**
 * Answers a Markdown request for the homepage with the llms.txt site map,
 * keeping the source asset's caching metadata so HEAD requests and
 * revalidation behave like any other asset.
 */
async function markdownHomepageResponse(request, env) {
  const source = await env.ASSETS.fetch(
    new Request(new URL("/llms.txt", request.url), {
      method: request.method,
    }),
  );

  if (!source.ok) {
    return null;
  }

  const headers = new Headers();

  for (const name of passthroughAssetHeaders) {
    const value = source.headers.get(name);

    if (value) {
      headers.set(name, value);
    }
  }

  headers.set("Content-Type", markdownContentType);
  headers.set("Vary", "Accept");

  return new Response(request.method === "HEAD" ? null : source.body, {
    status: 200,
    headers,
  });
}

/** Returns the response with Accept merged into its Vary header. */
function withVaryAccept(response) {
  const headers = new Headers(response.headers);
  headers.set("Vary", addAcceptToVary(headers.get("Vary")));

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request, env) {
    const acceptsMarkdown =
      (request.method === "GET" || request.method === "HEAD") &&
      prefersMarkdown(request.headers.get("Accept"));

    if (acceptsMarkdown && new URL(request.url).pathname === "/") {
      // The homepage is a designed landing page without a Markdown body, so
      // agents get the llms.txt site map as its Markdown mirror.
      const markdown = await markdownHomepageResponse(request, env);

      if (markdown) {
        return markdown;
      }
    }

    const response = await env.ASSETS.fetch(request);
    const contentType = (response.headers.get("Content-Type") ?? "")
      .toLowerCase();

    return contentType.startsWith("text/html")
      ? withVaryAccept(response)
      : response;
  },
};
