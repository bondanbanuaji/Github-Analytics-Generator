import 'piccolore';
import { p as decodeKey } from './chunks/astro/server_0A_MiSMj.mjs';
import 'clsx';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/astro-designed-error-pages_a_L84P3t.mjs';
import 'es-module-lexer';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///home/boba/Projects/Github%20Analytics%20Generator/","cacheDir":"file:///home/boba/Projects/Github%20Analytics%20Generator/node_modules/.astro/","outDir":"file:///home/boba/Projects/Github%20Analytics%20Generator/dist/","srcDir":"file:///home/boba/Projects/Github%20Analytics%20Generator/src/","publicDir":"file:///home/boba/Projects/Github%20Analytics%20Generator/public/","buildClientDir":"file:///home/boba/Projects/Github%20Analytics%20Generator/dist/client/","buildServerDir":"file:///home/boba/Projects/Github%20Analytics%20Generator/dist/server/","adapterName":"@astrojs/vercel","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image\\/?$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/github/[...path]","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/github(?:\\/(.*?))?\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"github","dynamic":false,"spread":false}],[{"content":"...path","dynamic":true,"spread":true}]],"params":["...path"],"component":"src/pages/api/github/[...path].ts","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/index.BtOpu0B_.css"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"site":"https://github-analytics-one.vercel.app","base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["/home/boba/Projects/Github Analytics Generator/src/pages/index.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000noop-middleware":"_noop-middleware.mjs","\u0000virtual:astro:actions/noop-entrypoint":"noop-entrypoint.mjs","\u0000@astro-page:src/pages/api/github/[...path]@_@ts":"pages/api/github/_---path_.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_DBjeKVH8.mjs","/home/boba/Projects/Github Analytics Generator/node_modules/astro/dist/assets/services/sharp.js":"chunks/sharp_BaXacdWY.mjs","/home/boba/Projects/Github Analytics Generator/src/layouts/Layout.astro?astro&type=script&index=0&lang.ts":"_astro/Layout.astro_astro_type_script_index_0_lang.DS5mLSIg.js","/home/boba/Projects/Github Analytics Generator/src/layouts/Layout.astro?astro&type=script&index=1&lang.ts":"_astro/Layout.astro_astro_type_script_index_1_lang.a9juqwXc.js","/home/boba/Projects/Github Analytics Generator/node_modules/html2canvas/dist/html2canvas.esm.js":"_astro/html2canvas.esm.B0tyYwQk.js","/home/boba/Projects/Github Analytics Generator/node_modules/dompurify/dist/purify.es.mjs":"_astro/purify.es.B9ZVCkUG.js","@astrojs/react/client.js":"_astro/client.V0xM-4tJ.js","/home/boba/Projects/Github Analytics Generator/src/components/Antigravity":"_astro/Antigravity.Bb5YCyi9.js","/home/boba/Projects/Github Analytics Generator/node_modules/canvg/lib/index.es.js":"_astro/index.es.D0gNr2wW.js","/home/boba/Projects/Github Analytics Generator/src/components/GitHubDashboard":"_astro/GitHubDashboard.D8sPPCpB.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/_astro/index.BtOpu0B_.css","/favicon.ico","/favicon.svg","/robots.txt","/_astro/Antigravity.Bb5YCyi9.js","/_astro/GitHubDashboard.BEumwpyE.js","/_astro/GitHubDashboard.D8sPPCpB.js","/_astro/Layout.astro_astro_type_script_index_0_lang.DS5mLSIg.js","/_astro/Layout.astro_astro_type_script_index_1_lang.a9juqwXc.js","/_astro/client.V0xM-4tJ.js","/_astro/html2canvas.esm.B0tyYwQk.js","/_astro/index.Bb8JjhAW.js","/_astro/index.CcHevvzP.js","/_astro/index.Dr7TU7rC.js","/_astro/index.es.D0gNr2wW.js","/_astro/jspdf.es.min.CFD2l6GE.js","/_astro/purify.es.B9ZVCkUG.js","/_astro/with-selector.fG4FxtSD.js","/logo/GitHub.png"],"buildFormat":"directory","checkOrigin":true,"allowedDomains":[],"serverIslandNameMap":[],"key":"U6SqoAy8N0+Pnm5z6eI6n3cHCnW+RabewxFpD8nJpv4="});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = null;

export { manifest };
