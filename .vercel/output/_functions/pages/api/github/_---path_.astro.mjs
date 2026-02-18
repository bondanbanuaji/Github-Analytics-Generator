export { renderers } from '../../../renderers.mjs';

const ALL = async ({ params, request }) => {
  const { path } = params;
  if (!path) {
    return new Response(JSON.stringify({ message: "Missing path" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const url = new URL(request.url);
  const searchParams = url.searchParams.toString();
  const githubUrl = `https://api.github.com/${path}${searchParams ? "?" + searchParams : ""}`;
  const headers = new Headers();
  headers.set("Accept", "application/vnd.github.v3+json");
  headers.set("User-Agent", "Github-Analytics-Generator");
  try {
    const response = await fetch(githubUrl, {
      method: request.method,
      headers
    });
    const contentType = response.headers.get("content-type");
    let body;
    if (contentType && contentType.includes("application/json")) {
      body = JSON.stringify(await response.json());
    } else {
      body = await response.text();
    }
    return new Response(body, {
      status: response.status,
      headers: {
        "Content-Type": contentType || "application/json",
        "X-RateLimit-Limit": response.headers.get("X-RateLimit-Limit") || "",
        "X-RateLimit-Remaining": response.headers.get("X-RateLimit-Remaining") || "",
        "X-RateLimit-Reset": response.headers.get("X-RateLimit-Reset") || "",
        "Link": response.headers.get("Link") || ""
      }
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response(JSON.stringify({
      message: "Internal Server Error",
      error: error?.message || "Unknown error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    ALL
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
