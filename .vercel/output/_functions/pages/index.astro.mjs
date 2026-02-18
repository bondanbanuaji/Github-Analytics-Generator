import { e as createAstro, f as createComponent, r as renderTemplate, k as renderSlot, l as renderComponent, n as renderHead, o as renderScript, u as unescapeHTML, h as addAttribute } from '../chunks/astro/server_0A_MiSMj.mjs';
import 'piccolore';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';
/* empty css                                 */
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Github, X, Loader2, Search, Clock, ExternalLink, Building2, MapPin, Link, Calendar, Users, BookOpen, Star, GitFork, Eye, FileCode, Info, ArrowLeftRight, ArrowRight, CheckCircle, Download, RefreshCw, AlertCircle, WifiOff, UserX, LayoutDashboard, GitCompareArrows } from 'lucide-react';
import 'clsx';
import { ResponsiveContainer, PieChart, Pie, Cell, Sector, BarChart, XAxis, YAxis, Tooltip, Bar, Legend } from 'recharts';
export { renderers } from '../renderers.mjs';

const AntigravityInner = ({
  count = 300,
  magnetRadius = 6,
  ringRadius = 12,
  waveSpeed = 0.1,
  waveAmplitude = 1,
  particleSize = 1.5,
  lerpSpeed = 0.05,
  color = "#2cfc03",
  autoAnimate = true,
  particleVariance = 1,
  rotationSpeed = 0.7,
  depthFactor = 1,
  pulseSpeed = 3,
  particleShape = "capsule",
  fieldStrength = 10
}) => {
  const meshRef = useRef(null);
  const { viewport } = useThree();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const lastMouseMoveTime = useRef(0);
  const virtualMouse = useRef({ x: 0, y: 0 });
  const particles = useMemo(() => {
    const temp = [];
    const width = viewport.width || 100;
    const height = viewport.height || 100;
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const x = (Math.random() - 0.5) * width;
      const y = (Math.random() - 0.5) * height;
      const z = (Math.random() - 0.5) * 20;
      const speed = 0.01 + Math.random() / 200;
      const randomRadiusOffset = (Math.random() - 0.5) * 2;
      temp.push({
        t,
        speed,
        mx: x,
        my: y,
        mz: z,
        cx: x,
        cy: y,
        cz: z,
        randomRadiusOffset
      });
    }
    return temp;
  }, [count, viewport.width, viewport.height]);
  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const { viewport: v, pointer: m } = state;
    const mouseDist = Math.sqrt(Math.pow(m.x - lastMousePos.current.x, 2) + Math.pow(m.y - lastMousePos.current.y, 2));
    if (mouseDist > 1e-3) {
      lastMouseMoveTime.current = Date.now();
      lastMousePos.current = { x: m.x, y: m.y };
    }
    let destX = m.x * v.width / 2;
    let destY = m.y * v.height / 2;
    if (autoAnimate && Date.now() - lastMouseMoveTime.current > 2e3) {
      const time = state.clock.getElapsedTime();
      destX = Math.sin(time * 0.5) * (v.width / 4);
      destY = Math.cos(time * 0.5 * 2) * (v.height / 4);
    }
    const mouseSmoothFactor = 1 - Math.pow(1e-3, delta);
    virtualMouse.current.x += (destX - virtualMouse.current.x) * mouseSmoothFactor;
    virtualMouse.current.y += (destY - virtualMouse.current.y) * mouseSmoothFactor;
    const targetX = virtualMouse.current.x;
    const targetY = virtualMouse.current.y;
    const globalRotation = state.clock.getElapsedTime() * rotationSpeed;
    const actualLerp = 1 - Math.pow(1 - lerpSpeed, delta * 60);
    particles.forEach((particle, i) => {
      let { t, speed, mx, my, mz, cz, randomRadiusOffset } = particle;
      t = particle.t += speed / 2 * (delta * 60);
      const projectionFactor = 1 - cz / 50;
      const projectedTargetX = targetX * projectionFactor;
      const projectedTargetY = targetY * projectionFactor;
      const dx = mx - projectedTargetX;
      const dy = my - projectedTargetY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let targetPos = { x: mx, y: my, z: mz * depthFactor };
      if (dist < magnetRadius) {
        const angle = Math.atan2(dy, dx) + globalRotation;
        const wave = Math.sin(t * waveSpeed + angle) * (0.5 * waveAmplitude);
        const deviation = randomRadiusOffset * (5 / (fieldStrength + 0.1));
        const currentRingRadius = ringRadius + wave + deviation;
        targetPos.x = projectedTargetX + currentRingRadius * Math.cos(angle);
        targetPos.y = projectedTargetY + currentRingRadius * Math.sin(angle);
        targetPos.z = mz * depthFactor + Math.sin(t) * (1 * waveAmplitude * depthFactor);
      }
      particle.cx += (targetPos.x - particle.cx) * actualLerp;
      particle.cy += (targetPos.y - particle.cy) * actualLerp;
      particle.cz += (targetPos.z - particle.cz) * actualLerp;
      dummy.position.set(particle.cx, particle.cy, particle.cz);
      dummy.lookAt(projectedTargetX, projectedTargetY, particle.cz);
      dummy.rotateX(Math.PI / 2);
      const currentDistToMouse = Math.sqrt(
        Math.pow(particle.cx - projectedTargetX, 2) + Math.pow(particle.cy - projectedTargetY, 2)
      );
      const distFromRing = Math.abs(currentDistToMouse - ringRadius);
      let scaleFactor = 1 - distFromRing / 10;
      scaleFactor = Math.max(0, Math.min(1, scaleFactor));
      const finalScale = scaleFactor * (0.8 + Math.sin(t * pulseSpeed) * 0.2 * particleVariance) * particleSize;
      dummy.scale.set(finalScale, finalScale, finalScale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });
  return /* @__PURE__ */ jsxs("instancedMesh", { ref: meshRef, args: [void 0, void 0, count], children: [
    particleShape === "capsule" && /* @__PURE__ */ jsx("capsuleGeometry", { args: [0.1, 0.4, 4, 8] }),
    particleShape === "sphere" && /* @__PURE__ */ jsx("sphereGeometry", { args: [0.2, 16, 16] }),
    particleShape === "box" && /* @__PURE__ */ jsx("boxGeometry", { args: [0.3, 0.3, 0.3] }),
    particleShape === "tetrahedron" && /* @__PURE__ */ jsx("tetrahedronGeometry", { args: [0.3] }),
    /* @__PURE__ */ jsx("meshBasicMaterial", { color })
  ] });
};
const Antigravity = (props) => {
  return /* @__PURE__ */ jsx(Canvas, { camera: { position: [0, 0, 50], fov: 35 }, children: /* @__PURE__ */ jsx(AntigravityInner, { ...props }) });
};

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://github-analytics-one.vercel.app");
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const {
    title = "GitHub Analytics Dashboard \u2014 Visualize Your GitHub Profile",
    description = "Analyze any GitHub profile with beautiful visualizations. View stats, language distribution, top repositories, contribution heatmap, and compare users side-by-side."
  } = Astro2.props;
  return renderTemplate(_a || (_a = __template(['<html lang="en" data-astro-cid-sckkx6r4> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="description"', '><meta name="keywords" content="github stats, github analytics, visualization, developer tools, github profile profile, github comparison"><link rel="canonical"', '><meta name="generator"', '><!-- Open Graph --><meta property="og:title"', '><meta property="og:description"', '><meta property="og:type" content="website"><meta property="og:url"', '><meta property="og:image" content="/logo/GitHub.png"><meta property="og:site_name" content="GitHub Analytics Dashboard"><!-- Twitter Card --><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title"', '><meta name="twitter:description"', '><meta name="twitter:image" content="/logo/GitHub.png"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"><link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet"><link rel="icon" type="image/png" href="/logo/GitHub.png"><title>', '</title><!-- JSON-LD for rich results --><script type="application/ld+json">', "<\/script>", "", '<script>\n            // Theme initialization (prevent flash)\n            const savedTheme = localStorage.getItem("theme") || "dark";\n            document.documentElement.setAttribute("data-theme", savedTheme);\n        <\/script>', '</head> <body class="dot-grid min-h-screen relative" data-astro-cid-sckkx6r4> <div class="mesh-bg" data-astro-cid-sckkx6r4></div> <div class="full-bg-animation" data-astro-cid-sckkx6r4> ', " </div> ", " </body></html>"])), addAttribute(description, "content"), addAttribute(Astro2.url.href, "href"), addAttribute(Astro2.generator, "content"), addAttribute(title, "content"), addAttribute(description, "content"), addAttribute(Astro2.url.href, "content"), addAttribute(title, "content"), addAttribute(description, "content"), title, unescapeHTML(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "GitHub Analytics Dashboard",
    description,
    url: Astro2.url.href,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "All",
    creator: {
      "@type": "Organization",
      name: "GitHub Analytics"
    }
  })), renderScript($$result, "/home/boba/Projects/Github Analytics Generator/src/layouts/Layout.astro?astro&type=script&index=0&lang.ts"), renderScript($$result, "/home/boba/Projects/Github Analytics Generator/src/layouts/Layout.astro?astro&type=script&index=1&lang.ts"), renderHead(), renderComponent($$result, "Antigravity", Antigravity, { "count": 300, "client:load": true, "magnetRadius": 6, "ringRadius": 12, "waveSpeed": 0.1, "waveAmplitude": 1, "particleSize": 1.5, "lerpSpeed": 0.05, "color": "#2cfc03", "autoAnimate": true, "particleVariance": 1, "rotationSpeed": 0.7, "depthFactor": 1, "pulseSpeed": 3, "particleShape": "capsule", "fieldStrength": 10, "client:component-hydration": "load", "client:component-path": "/home/boba/Projects/Github Analytics Generator/src/components/Antigravity", "client:component-export": "default", "data-astro-cid-sckkx6r4": true }), renderSlot($$result, $$slots["default"]));
}, "/home/boba/Projects/Github Analytics Generator/src/layouts/Layout.astro", void 0);

const ThemeToggle = () => {
  const [theme, setTheme] = useState("dark");
  useEffect(() => {
    const saved = localStorage.getItem("theme") || "dark";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };
  return /* @__PURE__ */ jsx(
    motion.button,
    {
      onClick: toggleTheme,
      whileTap: { scale: 0.9 },
      whileHover: { scale: 1.05 },
      className: "relative w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden",
      style: {
        background: "var(--bg-card)",
        border: "1px solid var(--border-primary)"
      },
      title: `Switch to ${theme === "dark" ? "light" : "dark"} mode`,
      children: /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: theme === "dark" ? /* @__PURE__ */ jsx(
        motion.div,
        {
          initial: { y: -20, opacity: 0, rotate: -90 },
          animate: { y: 0, opacity: 1, rotate: 0 },
          exit: { y: 20, opacity: 0, rotate: 90 },
          transition: { duration: 0.2 },
          children: /* @__PURE__ */ jsx(Moon, { className: "w-4.5 h-4.5", style: { color: "var(--accent-hover)" } })
        },
        "moon"
      ) : /* @__PURE__ */ jsx(
        motion.div,
        {
          initial: { y: -20, opacity: 0, rotate: -90 },
          animate: { y: 0, opacity: 1, rotate: 0 },
          exit: { y: 20, opacity: 0, rotate: 90 },
          transition: { duration: 0.2 },
          children: /* @__PURE__ */ jsx(Sun, { className: "w-4.5 h-4.5", style: { color: "var(--warning)" } })
        },
        "sun"
      ) })
    }
  );
};

const Header = () => {
  return /* @__PURE__ */ jsxs(
    motion.header,
    {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5 },
      className: "flex items-center justify-between py-5",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(
            motion.div,
            {
              whileHover: { rotate: 8, scale: 1.05 },
              className: "w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden",
              style: {
                background: "#ffffff",
                // Fixed white background
                border: "1px solid #e2e4e9",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
              },
              children: /* @__PURE__ */ jsx("img", { src: "/logo/GitHub.png", alt: "GitHub Logo", className: "w-6 h-6 object-contain" })
            }
          ),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h1", { className: "text-lg font-bold flex items-center gap-1.5", style: { color: "var(--text-primary)" }, children: "GitHub Analytics" }),
            /* @__PURE__ */ jsx("p", { className: "text-[11px] font-medium", style: { color: "var(--text-muted)" }, children: "Powered by GitHub REST API" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            motion.a,
            {
              whileHover: { scale: 1.05 },
              whileTap: { scale: 0.95 },
              href: "https://github.com/bondanbanuaji/Github-Analytics-Generator",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "w-10 h-10 rounded-xl flex items-center justify-center",
              style: {
                background: "var(--bg-card)",
                border: "1px solid var(--border-primary)",
                transform: "scale(1.05)"
              },
              title: "GitHub",
              tabIndex: 0,
              children: /* @__PURE__ */ jsx(Github, { className: "w-4.5 h-4.5", style: { color: "var(--text-secondary)" }, "aria-hidden": "true" })
            }
          ),
          /* @__PURE__ */ jsx(ThemeToggle, {})
        ] })
      ]
    }
  );
};

const SearchBar = ({
  onSearch,
  loading,
  initialValue = ""
}) => {
  const [query, setQuery] = useState(initialValue);
  const [focused, setFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);
  useEffect(() => {
    const saved = localStorage.getItem("gh-recent-searches");
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);
  useEffect(() => {
    if (initialValue) setQuery(initialValue);
  }, [initialValue]);
  const handleSearch = (username) => {
    const searchTerm = (username || query).trim();
    if (!searchTerm || loading) return;
    const updated = [searchTerm, ...recentSearches.filter((s) => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("gh-recent-searches", JSON.stringify(updated));
    onSearch(searchTerm);
    setFocused(false);
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };
  const clearSearch = () => {
    setQuery("");
    inputRef.current?.focus();
  };
  const removeRecent = (e, username) => {
    e.stopPropagation();
    const updated = recentSearches.filter((s) => s !== username);
    setRecentSearches(updated);
    localStorage.setItem("gh-recent-searches", JSON.stringify(updated));
  };
  return /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-lg lg:max-w-xl mx-auto", children: [
    /* @__PURE__ */ jsx(
      motion.div,
      {
        animate: focused ? { scale: 1.01 } : { scale: 1 },
        className: "rounded-2xl overflow-hidden transition-all duration-300",
        style: {
          background: "var(--bg-card)",
          border: `1px solid ${focused ? "var(--accent)" : "var(--border-primary)"}`,
          boxShadow: focused ? "0 0 0 3px var(--accent-soft), 0 8px 32px var(--shadow-color)" : "0 4px 16px var(--shadow-color)"
        },
        children: /* @__PURE__ */ jsxs("div", { className: "flex items-center px-4 sm:px-5 py-2.5 sm:py-3 gap-2 sm:gap-3", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              ref: inputRef,
              type: "text",
              value: query,
              onChange: (e) => setQuery(e.target.value),
              onKeyDown: handleKeyDown,
              onFocus: () => setFocused(true),
              onBlur: () => setTimeout(() => setFocused(false), 200),
              placeholder: "Search GitHub username...",
              className: "flex-1 p-2 bg-transparent border-none outline-none text-sm sm:text-base lg:text-md font-medium min-w-0",
              style: {
                color: "var(--text-primary)",
                fontFamily: "Inter, sans-serif"
              }
            }
          ),
          query && /* @__PURE__ */ jsx(
            "button",
            {
              onClick: clearSearch,
              className: "p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-secondary)]",
              style: { color: "var(--text-muted)" },
              children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4 sm:w-4.5 sm:h-4.5" })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handleSearch(),
              disabled: loading || !query.trim(),
              className: "btn-primary py-1.5 px-4 sm:px-5 lg:px-6 rounded-xl flex items-center justify-center gap-2 group disabled:opacity-40 transition-all duration-300",
              children: loading ? /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 sm:w-4.5 sm:h-4.5 animate-spin" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("span", { className: "hidden sm:inline font-bold text-[10px] sm:text-xs lg:text-sm uppercase tracking-wider", children: "Search" }),
                /* @__PURE__ */ jsx(Search, { className: "w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:scale-110" })
              ] })
            }
          )
        ] })
      }
    ),
    /* @__PURE__ */ jsx(AnimatePresence, { children: focused && recentSearches.length > 0 && !query && /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: -8, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -8, scale: 0.98 },
        transition: { duration: 0.15 },
        className: "absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-50",
        style: {
          background: "var(--bg-card)",
          border: "1px solid var(--border-primary)",
          boxShadow: "0 12px 40px var(--shadow-color)"
        },
        children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "px-4 py-2.5 border-b text-[11px] font-semibold uppercase tracking-wider",
              style: { borderColor: "var(--border-primary)", color: "var(--text-muted)" },
              children: "Recent"
            }
          ),
          recentSearches.map((username) => /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => {
                setQuery(username);
                handleSearch(username);
              },
              className: "w-full px-4 py-3 flex items-center gap-3 transition-colors group",
              style: { color: "var(--text-primary)" },
              onMouseEnter: (e) => e.currentTarget.style.background = "var(--accent-soft)",
              onMouseLeave: (e) => e.currentTarget.style.background = "transparent",
              children: [
                /* @__PURE__ */ jsx(Clock, { className: "w-3.5 h-3.5", style: { color: "var(--text-muted)" } }),
                /* @__PURE__ */ jsx("span", { className: "flex-1 text-left text-sm font-medium", children: username }),
                /* @__PURE__ */ jsx(
                  X,
                  {
                    className: "w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity",
                    style: { color: "var(--text-muted)" },
                    onClick: (e) => removeRecent(e, username)
                  }
                )
              ]
            },
            username
          ))
        ]
      }
    ) })
  ] });
};

function formatNumber(num) {
  if (num >= 1e6) {
    return (num / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return num.toString();
}
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = /* @__PURE__ */ new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1e3 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}
const LANGUAGE_COLORS = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Go: "#00ADD8",
  Rust: "#dea584",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  SCSS: "#c6538c",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Lua: "#000080",
  R: "#198CE7",
  Scala: "#c22d40",
  Elixir: "#6e4a7e",
  Haskell: "#5e5086",
  Clojure: "#db5855",
  Perl: "#0298c3",
  Vim: "#019933",
  Dockerfile: "#384d54",
  Makefile: "#427819",
  Jupyter: "#DA5B0B",
  Astro: "#ff5a03",
  MDX: "#fcb32c"
};
function getLanguageColor(language) {
  return LANGUAGE_COLORS[language] || "#8b949e";
}

const ProfileCard = ({ user }) => {
  return /* @__PURE__ */ jsx(
    motion.div,
    {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5 },
      className: "rounded-2xl p-6 md:p-8 glow-hover",
      style: {
        background: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
        boxShadow: "0 4px 24px var(--shadow-color)"
      },
      children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-center sm:items-start gap-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative group", children: [
          /* @__PURE__ */ jsx(
            motion.div,
            {
              className: "absolute inset-0 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500",
              style: { background: "linear-gradient(135deg, var(--accent), var(--purple))" }
            }
          ),
          /* @__PURE__ */ jsx(
            motion.img,
            {
              whileHover: { scale: 1.05 },
              src: user.avatar_url,
              alt: `${user.login}'s avatar`,
              className: "w-28 h-28 rounded-2xl relative z-10 object-cover",
              style: { border: "3px solid var(--border-primary)" }
            }
          ),
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 z-20 flex items-center justify-center",
              style: {
                background: "var(--success)",
                borderColor: "var(--bg-card)"
              },
              children: /* @__PURE__ */ jsx("div", { className: "w-2 h-2 rounded-full bg-white" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 text-center sm:text-left", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center gap-2 mb-2", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold", style: { color: "var(--text-primary)" }, children: user.name || user.login }),
            /* @__PURE__ */ jsxs(
              "a",
              {
                href: user.html_url,
                target: "_blank",
                rel: "noopener noreferrer",
                className: "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all hover:opacity-80",
                style: {
                  background: "var(--accent-soft)",
                  color: "var(--accent)"
                },
                children: [
                  "@",
                  user.login,
                  /* @__PURE__ */ jsx(ExternalLink, { className: "w-3 h-3" })
                ]
              }
            )
          ] }),
          user.bio && /* @__PURE__ */ jsx(
            "p",
            {
              className: "text-sm mb-4 max-w-lg leading-relaxed",
              style: { color: "var(--text-secondary)" },
              children: user.bio
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-2 text-sm mb-4", children: [
            user.company && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", style: { color: "var(--text-secondary)" }, children: [
              /* @__PURE__ */ jsx(Building2, { className: "w-3.5 h-3.5" }),
              user.company
            ] }),
            user.location && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", style: { color: "var(--text-secondary)" }, children: [
              /* @__PURE__ */ jsx(MapPin, { className: "w-3.5 h-3.5" }),
              user.location
            ] }),
            user.blog && /* @__PURE__ */ jsxs(
              "a",
              {
                href: user.blog.startsWith("http") ? user.blog : `https://${user.blog}`,
                target: "_blank",
                rel: "noopener noreferrer",
                className: "flex items-center gap-1.5 hover:underline",
                style: { color: "var(--accent)" },
                children: [
                  /* @__PURE__ */ jsx(Link, { className: "w-3.5 h-3.5" }),
                  user.blog.replace(/^https?:\/\//, "").replace(/\/$/, "")
                ]
              }
            ),
            /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", style: { color: "var(--text-muted)" }, children: [
              /* @__PURE__ */ jsx(Calendar, { className: "w-3.5 h-3.5" }),
              "Joined ",
              formatDate(user.created_at)
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-center sm:justify-start gap-5", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx(Users, { className: "w-4 h-4", style: { color: "var(--text-muted)" } }),
              /* @__PURE__ */ jsx("span", { className: "font-bold text-sm", style: { color: "var(--text-primary)" }, children: formatNumber(user.followers) }),
              /* @__PURE__ */ jsx("span", { style: { color: "var(--text-muted)" }, className: "text-xs", children: "followers" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "w-px h-4", style: { background: "var(--border-primary)" } }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsx("span", { className: "font-bold text-sm", style: { color: "var(--text-primary)" }, children: formatNumber(user.following) }),
              /* @__PURE__ */ jsx("span", { style: { color: "var(--text-muted)" }, className: "text-xs", children: "following" })
            ] })
          ] })
        ] })
      ] })
    }
  );
};

const stats = [
  {
    key: "repos",
    label: "Repositories",
    icon: BookOpen,
    gradient: "linear-gradient(135deg, #6366f1, #818cf8)",
    bgLight: "rgba(99, 102, 241, 0.08)",
    iconColor: "#6366f1",
    field: "totalRepos"
  },
  {
    key: "stars",
    label: "Total Stars",
    icon: Star,
    gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)",
    bgLight: "rgba(245, 158, 11, 0.08)",
    iconColor: "#f59e0b",
    field: "totalStars"
  },
  {
    key: "forks",
    label: "Total Forks",
    icon: GitFork,
    gradient: "linear-gradient(135deg, #22c55e, #4ade80)",
    bgLight: "rgba(34, 197, 94, 0.08)",
    iconColor: "#22c55e",
    field: "totalForks"
  },
  {
    key: "followers",
    label: "Followers",
    icon: Users,
    gradient: "linear-gradient(135deg, #a855f7, #c084fc)",
    bgLight: "rgba(168, 85, 247, 0.08)",
    iconColor: "#a855f7",
    field: "followers"
  },
  {
    key: "watchers",
    label: "Watchers",
    icon: Eye,
    gradient: "linear-gradient(135deg, #ec4899, #f472b6)",
    bgLight: "rgba(236, 72, 153, 0.08)",
    iconColor: "#ec4899",
    field: "totalWatchers"
  },
  {
    key: "gists",
    label: "Public Gists",
    icon: FileCode,
    gradient: "linear-gradient(135deg, #06b6d4, #22d3ee)",
    bgLight: "rgba(6, 182, 212, 0.08)",
    iconColor: "#06b6d4",
    field: "publicGists"
  }
];
const StatsCards = (props) => {
  return /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3", children: stats.map((stat, index) => {
    const Icon = stat.icon;
    const value = props[stat.field];
    return /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 20, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: { duration: 0.4, delay: index * 0.06 },
        className: "stat-card text-center group cursor-default",
        style: { "--stat-gradient": stat.gradient },
        children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 transition-transform duration-300 group-hover:scale-110",
              style: { background: stat.bgLight },
              children: /* @__PURE__ */ jsx(Icon, { className: "w-5 h-5", style: { color: stat.iconColor } })
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold mb-0.5", style: { color: "var(--text-primary)" }, children: formatNumber(value) }),
          /* @__PURE__ */ jsx("div", { className: "text-[11px] font-medium", style: { color: "var(--text-muted)" }, children: stat.label })
        ]
      },
      stat.key
    );
  }) });
};

const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
  return /* @__PURE__ */ jsxs("g", { children: [
    /* @__PURE__ */ jsx(
      "text",
      {
        x: cx,
        y: cy - 10,
        dy: 0,
        textAnchor: "middle",
        fill: "var(--text-primary)",
        style: { fontSize: "15px", fontWeight: 700, fontFamily: "Inter" },
        children: payload.name
      }
    ),
    /* @__PURE__ */ jsx(
      "text",
      {
        x: cx,
        y: cy + 14,
        textAnchor: "middle",
        fill: "var(--text-secondary)",
        style: { fontSize: "12px", fontFamily: "Inter" },
        children: `${(percent * 100).toFixed(1)}%`
      }
    ),
    /* @__PURE__ */ jsx(
      Sector,
      {
        cx,
        cy,
        innerRadius,
        outerRadius: outerRadius + 8,
        startAngle,
        endAngle,
        fill
      }
    ),
    /* @__PURE__ */ jsx(
      Sector,
      {
        cx,
        cy,
        startAngle,
        endAngle,
        innerRadius: outerRadius + 12,
        outerRadius: outerRadius + 15,
        fill,
        opacity: 0.3
      }
    )
  ] });
};
const LanguageChart = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  if (data.length === 0) {
    return /* @__PURE__ */ jsx(
      "div",
      {
        className: "rounded-2xl p-6 text-center text-sm",
        style: { background: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border-primary)" },
        children: "No language data available"
      }
    );
  }
  const top8 = data.slice(0, 8);
  const others = data.slice(8);
  const chartData = others.length > 0 ? [...top8, {
    name: "Others",
    value: others.reduce((sum, l) => sum + l.value, 0),
    color: "#6b7280",
    percentage: others.reduce((sum, l) => sum + l.percentage, 0)
  }] : top8;
  return /* @__PURE__ */ jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5, delay: 0.2 },
      className: "rounded-2xl p-6",
      style: {
        background: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
        boxShadow: "0 4px 24px var(--shadow-color)"
      },
      children: [
        /* @__PURE__ */ jsx(
          "h3",
          {
            className: "text-sm font-semibold mb-5 uppercase tracking-wider",
            style: { color: "var(--text-muted)" },
            children: "Language Distribution"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col lg:flex-row items-center gap-6 xl:gap-10", children: [
          /* @__PURE__ */ jsx("div", { className: "w-full lg:w-1/2 xl:w-2/5 min-w-0", style: { height: 280 }, children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsx(PieChart, { children: /* @__PURE__ */ jsx(
            Pie,
            {
              activeIndex,
              activeShape: renderActiveShape,
              data: chartData,
              cx: "50%",
              cy: "50%",
              innerRadius: 60,
              outerRadius: 90,
              paddingAngle: 3,
              dataKey: "value",
              onMouseEnter: (_, index) => setActiveIndex(index),
              children: chartData.map((entry, index) => /* @__PURE__ */ jsx(Cell, { fill: entry.color, stroke: "transparent" }, index))
            }
          ) }) }) }),
          /* @__PURE__ */ jsx("div", { className: "w-full lg:w-1/2 xl:w-3/5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3", children: chartData.map((lang, index) => /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setActiveIndex(index),
              className: "flex items-center gap-2 sm:gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-300 group",
              style: {
                background: activeIndex === index ? "var(--accent-soft)" : "transparent",
                border: activeIndex === index ? "1px solid var(--accent)" : "1px solid var(--border-subtle)",
                opacity: activeIndex === index ? 1 : 0.8
              },
              children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0 shadow-sm",
                    style: { backgroundColor: lang.color }
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                  /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: "text-xs sm:text-sm font-bold truncate",
                      style: { color: "var(--text-primary)" },
                      children: lang.name
                    }
                  ),
                  /* @__PURE__ */ jsxs(
                    "div",
                    {
                      className: "text-[10px] sm:text-xs font-semibold",
                      style: { color: "var(--text-muted)" },
                      children: [
                        lang.percentage,
                        "%"
                      ]
                    }
                  )
                ] })
              ]
            },
            lang.name
          )) })
        ] })
      ]
    }
  );
};

const RepoCard = ({ repo, index }) => {
  return /* @__PURE__ */ jsxs(
    motion.a,
    {
      href: repo.html_url,
      target: "_blank",
      rel: "noopener noreferrer",
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.4, delay: index * 0.06 },
      whileHover: { y: -3 },
      className: "rounded-xl p-5 block group cursor-pointer transition-all duration-300",
      style: {
        background: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
        textDecoration: "none",
        boxShadow: "0 2px 8px var(--shadow-color)"
      },
      onMouseEnter: (e) => {
        e.currentTarget.style.borderColor = "var(--accent)";
        e.currentTarget.style.boxShadow = "0 8px 32px var(--shadow-color), 0 0 0 1px var(--accent-soft)";
      },
      onMouseLeave: (e) => {
        e.currentTarget.style.borderColor = "var(--border-primary)";
        e.currentTarget.style.boxShadow = "0 2px 8px var(--shadow-color)";
      },
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2 mb-2.5", children: [
          /* @__PURE__ */ jsx(
            "h4",
            {
              className: "font-bold text-sm truncate group-hover:underline",
              style: { color: "var(--accent)" },
              children: repo.name
            }
          ),
          /* @__PURE__ */ jsx(
            ExternalLink,
            {
              className: "w-3.5 h-3.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity",
              style: { color: "var(--text-muted)" }
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "p",
          {
            className: "text-xs mb-4 line-clamp-2 leading-relaxed",
            style: { color: "var(--text-secondary)", minHeight: "2rem" },
            children: repo.description || "No description provided"
          }
        ),
        repo.topics && repo.topics.length > 0 && /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-1.5 mb-3", children: [
          repo.topics.slice(0, 3).map((topic) => /* @__PURE__ */ jsx(
            "span",
            {
              className: "px-2 py-0.5 rounded-md text-[10px] font-semibold",
              style: { background: "var(--accent-soft)", color: "var(--accent)" },
              children: topic
            },
            topic
          )),
          repo.topics.length > 3 && /* @__PURE__ */ jsxs(
            "span",
            {
              className: "text-[10px] font-medium px-1",
              style: { color: "var(--text-muted)" },
              children: [
                "+",
                repo.topics.length - 3
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 text-[11px]", style: { color: "var(--text-muted)" }, children: [
          repo.language && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx(
              "span",
              {
                className: "w-2.5 h-2.5 rounded-full",
                style: { backgroundColor: getLanguageColor(repo.language) }
              }
            ),
            repo.language
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsx(Star, { className: "w-3 h-3" }),
            formatNumber(repo.stargazers_count)
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsx(GitFork, { className: "w-3 h-3" }),
            formatNumber(repo.forks_count)
          ] }),
          /* @__PURE__ */ jsx("span", { className: "ml-auto text-[10px]", children: formatDate(repo.updated_at) })
        ] })
      ]
    }
  );
};
const TopRepos = ({ repos }) => {
  if (repos.length === 0) {
    return /* @__PURE__ */ jsx(
      "div",
      {
        className: "rounded-2xl p-6 text-center text-sm",
        style: { background: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border-primary)" },
        children: "No repositories found"
      }
    );
  }
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(
      motion.h3,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        className: "text-sm font-semibold mb-4 uppercase tracking-wider",
        style: { color: "var(--text-muted)" },
        children: "Top Repositories"
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3", children: repos.map((repo, index) => /* @__PURE__ */ jsx(RepoCard, { repo, index }, repo.id)) })
  ] });
};

const ActivityHeatmap = ({ data }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const [isChartReady, setIsChartReady] = useState(false);
  const THEME_COLORS = {
    light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
    dark: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"]
  };
  const { chartPoints, totalContributions, months } = useMemo(() => {
    const today = /* @__PURE__ */ new Date();
    const endDate = new Date(today);
    endDate.setHours(0, 0, 0, 0);
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 364);
    const dayOfStart = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfStart);
    const points = [];
    const monthMarkers = [];
    let total = 0;
    let lastMonth = -1;
    for (let w = 0; w < 53; w++) {
      for (let d = 0; d < 7; d++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + w * 7 + d);
        const dateStr = currentDate.toISOString().split("T")[0];
        const count = data[dateStr] || 0;
        total += count;
        let v = 0;
        if (count > 0) {
          if (count === 1) v = 1;
          else if (count <= 3) v = 2;
          else if (count <= 6) v = 3;
          else v = 4;
        }
        points.push({
          x: w,
          y: d,
          // 0 = Sun, 6 = Sat. We will reverse Y axis in Chart.js so 0 is top.
          v,
          count,
          date: dateStr
        });
        if (d === 0) {
          const m = currentDate.getMonth();
          if (m !== lastMonth) {
            monthMarkers.push({
              index: w,
              label: currentDate.toLocaleString("en-US", { month: "short" })
            });
            lastMonth = m;
          }
        }
      }
    }
    return { chartPoints: points, totalContributions: total, months: monthMarkers };
  }, [data]);
  useEffect(() => {
    const check = () => {
      if (window.Chart) {
        setIsChartReady(true);
      } else {
        setTimeout(check, 200);
      }
    };
    check();
  }, []);
  useEffect(() => {
    if (!isChartReady || !canvasRef.current) return;
    if (chartRef.current) {
      chartRef.current.destroy();
    }
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    const isDark2 = document.documentElement.getAttribute("data-theme") === "dark";
    const colors = isDark2 ? THEME_COLORS.dark : THEME_COLORS.light;
    chartRef.current = new window.Chart(ctx, {
      type: "scatter",
      data: {
        datasets: [{
          label: "Contributions",
          data: chartPoints,
          backgroundColor: (cnx) => {
            const val = cnx.raw?.v ?? 0;
            return colors[val];
          },
          pointRadius: (ctx2) => {
            return 5.5;
          },
          pointHoverRadius: 7,
          pointStyle: "rectRounded",
          // Rounded squares
          borderWidth: 0,
          hoverBorderWidth: 1,
          hoverBorderColor: isDark2 ? "#fff" : "#000"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        layout: {
          padding: { top: 20, right: 10, bottom: 10, left: 10 }
        },
        scales: {
          x: {
            type: "linear",
            min: -0.5,
            max: 53.5,
            position: "top",
            grid: { display: false, drawBorder: false },
            border: { display: false },
            ticks: {
              stepSize: 1,
              autoSkip: false,
              callback: (val) => {
                const m = months.find((mo) => mo.index === val);
                return m ? m.label : "";
              },
              color: isDark2 ? "#8b949e" : "#57606a",
              font: { size: 10, family: "Inter" },
              maxRotation: 0,
              padding: 0
            }
          },
          y: {
            type: "linear",
            min: -0.5,
            max: 6.5,
            reverse: true,
            // 0 at top
            grid: { display: false, drawBorder: false },
            border: { display: false },
            ticks: {
              stepSize: 1,
              callback: (val) => {
                if (val === 1) return "Mon";
                if (val === 3) return "Wed";
                if (val === 5) return "Fri";
                return "";
              },
              color: isDark2 ? "#8b949e" : "#57606a",
              font: { size: 9, family: "Inter" },
              padding: 5
            }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            backgroundColor: isDark2 ? "rgba(22,27,34, 0.95)" : "rgba(255,255,255, 0.95)",
            titleColor: isDark2 ? "#ffffff" : "#24292f",
            bodyColor: isDark2 ? "#ffffff" : "#24292f",
            borderColor: isDark2 ? "#30363d" : "#d0d7de",
            borderWidth: 1,
            padding: 10,
            cornerRadius: 6,
            displayColors: false,
            callbacks: {
              title: () => "",
              label: (cnx) => {
                const p = cnx.raw;
                const d = new Date(p.date);
                const dateStr = d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "short", day: "numeric" });
                const countStr = p.count === 0 ? "No contributions" : `${p.count} contribution${p.count === 1 ? "" : "s"}`;
                return `${countStr} on ${dateStr}`;
              }
            }
          }
        }
      }
    });
  }, [isChartReady, chartPoints, months]);
  const isDark = typeof document !== "undefined" && document.documentElement.getAttribute("data-theme") === "dark";
  const legendColors = isDark ? THEME_COLORS.dark : THEME_COLORS.light;
  return /* @__PURE__ */ jsxs("div", { className: "card p-4 sm:p-6 w-full overflow-hidden", children: [
    /* @__PURE__ */ jsx("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2", children: /* @__PURE__ */ jsxs("h3", { className: "font-bold text-sm sm:text-base lg:text-lg", style: { color: "var(--text-primary)" }, children: [
      totalContributions.toLocaleString(),
      " contributions in the last year"
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "relative w-full h-[180px] sm:h-[200px] lg:h-[220px] overflow-hidden", children: [
      !isChartReady && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center text-sm text-[var(--text-muted)]", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("div", { className: "w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" }),
        "Loading chart..."
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "w-full h-full min-w-0", children: /* @__PURE__ */ jsx("canvas", { ref: canvasRef }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row items-center justify-between mt-4 gap-4 text-[10px] sm:text-xs", style: { color: "var(--text-muted)" }, children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 order-2 md:order-1", children: [
        /* @__PURE__ */ jsx(Info, { className: "w-3.5 h-3.5" }),
        /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Recent activity (GitHub API limit 90 days)" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 order-1 md:order-2 bg-[var(--bg-secondary)] px-3 py-1.5 rounded-lg border border-[var(--border-subtle)]", children: [
        /* @__PURE__ */ jsx("span", { className: "font-semibold uppercase tracking-tight opacity-70", children: "Less" }),
        /* @__PURE__ */ jsx("div", { className: "flex gap-1.5", children: legendColors.map((color, i) => /* @__PURE__ */ jsx(
          "div",
          {
            style: { backgroundColor: color },
            className: "w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-[2px] border border-black/10 transition-transform hover:scale-125 cursor-help",
            title: `Level ${i}`
          },
          i
        )) }),
        /* @__PURE__ */ jsx("span", { className: "font-semibold uppercase tracking-tight opacity-70", children: "More" })
      ] })
    ] })
  ] });
};

const API_BASE = "/api/github";
async function fetchJSON(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github.v3+json"
    }
  });
  if (!response.ok) {
    if (response.status === 404) {
      throw {
        type: "not_found",
        message: "User not found. Please check the username and try again."
      };
    }
    if (response.status === 403) {
      const resetHeader = response.headers.get("X-RateLimit-Reset");
      const resetTime = resetHeader ? parseInt(resetHeader) * 1e3 : void 0;
      throw {
        type: "rate_limit",
        message: "API rate limit exceeded. Please wait a moment and try again.",
        resetTime
      };
    }
    throw {
      type: "unknown",
      message: `GitHub API error: ${response.status} ${response.statusText}`
    };
  }
  return response.json();
}
async function fetchUserProfile(username) {
  return fetchJSON(`${API_BASE}/users/${encodeURIComponent(username)}`);
}
async function fetchUserRepos(username) {
  const allRepos = [];
  let page = 1;
  const perPage = 100;
  while (true) {
    const repos = await fetchJSON(
      `${API_BASE}/users/${encodeURIComponent(username)}/repos?per_page=${perPage}&page=${page}&sort=updated`
    );
    allRepos.push(...repos);
    if (repos.length < perPage) break;
    page++;
    if (page > 10) break;
  }
  return allRepos;
}
async function fetchUserEvents(username) {
  try {
    const pages = [1, 2, 3];
    const allEvents = await Promise.all(
      pages.map(
        (page) => fetchJSON(`${API_BASE}/users/${encodeURIComponent(username)}/events?per_page=100&page=${page}`)
      )
    );
    return allEvents.flat();
  } catch {
    return [];
  }
}
function processLanguageStats(repos) {
  const langCount = {};
  let total = 0;
  for (const repo of repos) {
    if (repo.language && !repo.fork) {
      langCount[repo.language] = (langCount[repo.language] || 0) + 1;
      total++;
    }
  }
  return Object.entries(langCount).map(([name, value]) => ({
    name,
    value,
    color: getLanguageColor(name),
    percentage: total > 0 ? Math.round(value / total * 100) : 0
  })).sort((a, b) => b.value - a.value);
}
function getTopRepos(repos, count = 6) {
  return [...repos].filter((r) => !r.fork).sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, count);
}
function calculateTotalStats(repos) {
  return repos.reduce(
    (acc, repo) => ({
      totalStars: acc.totalStars + repo.stargazers_count,
      totalForks: acc.totalForks + repo.forks_count,
      totalWatchers: acc.totalWatchers + repo.watchers_count
    }),
    { totalStars: 0, totalForks: 0, totalWatchers: 0 }
  );
}
function processContributionData(events) {
  const contributions = {};
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 364);
  const dayOfWeek = startDate.getDay();
  startDate.setDate(startDate.getDate() - dayOfWeek);
  const currentDate = new Date(startDate);
  while (currentDate <= today || Object.keys(contributions).length < 371) {
    const key = currentDate.toISOString().split("T")[0];
    contributions[key] = 0;
    currentDate.setDate(currentDate.getDate() + 1);
    if (Object.keys(contributions).length > 380) break;
  }
  for (const event of events) {
    if (event.created_at) {
      const date = event.created_at.split("T")[0];
      if (contributions[date] !== void 0) {
        contributions[date]++;
      }
    }
  }
  return contributions;
}

const CompareUsers = () => {
  const [username1, setUsername1] = useState("");
  const [username2, setUsername2] = useState("");
  const [user1Data, setUser1Data] = useState(null);
  const [user2Data, setUser2Data] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fetchCompareData = async (username) => {
    const [user, repos] = await Promise.all([
      fetchUserProfile(username),
      fetchUserRepos(username)
    ]);
    const stats = calculateTotalStats(repos);
    const languageStats = processLanguageStats(repos);
    return { user, repos, ...stats, languageStats };
  };
  const handleCompare = async () => {
    if (!username1.trim() || !username2.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const [data1, data2] = await Promise.all([
        fetchCompareData(username1.trim()),
        fetchCompareData(username2.trim())
      ]);
      setUser1Data(data1);
      setUser2Data(data2);
    } catch (err) {
      setError(err.message || "Failed to fetch user data. Please check usernames and try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleCompare();
  };
  const clearComparison = () => {
    setUser1Data(null);
    setUser2Data(null);
    setUsername1("");
    setUsername2("");
    setError(null);
  };
  const statsComparison = user1Data && user2Data ? [
    { name: "Repos", [user1Data.user.login]: user1Data.user.public_repos, [user2Data.user.login]: user2Data.user.public_repos },
    { name: "Stars", [user1Data.user.login]: user1Data.totalStars, [user2Data.user.login]: user2Data.totalStars },
    { name: "Forks", [user1Data.user.login]: user1Data.totalForks, [user2Data.user.login]: user2Data.totalForks },
    { name: "Followers", [user1Data.user.login]: user1Data.user.followers, [user2Data.user.login]: user2Data.user.followers },
    { name: "Following", [user1Data.user.login]: user1Data.user.following, [user2Data.user.login]: user2Data.user.following }
  ] : [];
  return /* @__PURE__ */ jsxs(
    motion.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      className: "space-y-6 max-w-5xl mx-auto",
      children: [
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: "rounded-2xl p-6 md:p-8 text-center",
            style: {
              background: "var(--bg-card)",
              border: "1px solid var(--border-primary)",
              boxShadow: "0 4px 24px var(--shadow-color)"
            },
            children: [
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: "w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4",
                  style: { background: "var(--accent-soft)" },
                  children: /* @__PURE__ */ jsx(Users, { className: "w-6 h-6", style: { color: "var(--accent)" } })
                }
              ),
              /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold mb-6", style: { color: "var(--text-primary)" }, children: "Compare GitHub Users" }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row items-center gap-3 mb-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "relative flex-1 w-full group", children: [
                  /* @__PURE__ */ jsx(
                    Search,
                    {
                      className: "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
                      style: { color: "var(--text-muted)" }
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      value: username1,
                      onChange: (e) => setUsername1(e.target.value),
                      onKeyDown: handleKeyDown,
                      placeholder: "First username...",
                      className: "w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium outline-none transition-all duration-200",
                      style: {
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-primary)",
                        color: "var(--text-primary)"
                      },
                      onFocus: (e) => {
                        e.currentTarget.style.borderColor = "var(--accent)";
                        e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-soft)";
                      },
                      onBlur: (e) => {
                        e.currentTarget.style.borderColor = "var(--border-primary)";
                        e.currentTarget.style.boxShadow = "none";
                      }
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx("div", { className: "rounded-full p-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)]", children: /* @__PURE__ */ jsx(ArrowLeftRight, { className: "w-4 h-4", style: { color: "var(--text-muted)" } }) }),
                /* @__PURE__ */ jsxs("div", { className: "relative flex-1 w-full group", children: [
                  /* @__PURE__ */ jsx(
                    Search,
                    {
                      className: "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
                      style: { color: "var(--text-muted)" }
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      value: username2,
                      onChange: (e) => setUsername2(e.target.value),
                      onKeyDown: handleKeyDown,
                      placeholder: "Second username...",
                      className: "w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium outline-none transition-all duration-200",
                      style: {
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-primary)",
                        color: "var(--text-primary)"
                      },
                      onFocus: (e) => {
                        e.currentTarget.style.borderColor = "var(--purple)";
                        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(168, 85, 247, 0.12)";
                      },
                      onBlur: (e) => {
                        e.currentTarget.style.borderColor = "var(--border-primary)";
                        e.currentTarget.style.boxShadow = "none";
                      }
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: handleCompare,
                  disabled: loading || !username1.trim() || !username2.trim(),
                  className: "w-full md:w-auto px-8 py-3 rounded-xl text-white font-semibold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto",
                  style: {
                    background: "linear-gradient(135deg, var(--accent), var(--purple))",
                    boxShadow: "0 4px 16px var(--accent-glow)"
                  },
                  children: loading ? /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                    "Compare Profiles",
                    /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4" })
                  ] })
                }
              ),
              error && /* @__PURE__ */ jsxs(
                motion.div,
                {
                  initial: { opacity: 0, y: 10 },
                  animate: { opacity: 1, y: 0 },
                  className: "mt-4 p-3 rounded-lg text-sm flex items-center justify-center gap-2",
                  style: { background: "rgba(239, 68, 68, 0.1)", color: "var(--danger)" },
                  children: [
                    /* @__PURE__ */ jsx(X, { className: "w-4 h-4" }),
                    error
                  ]
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: user1Data && user2Data && /* @__PURE__ */ jsxs(
          motion.div,
          {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -20 },
            className: "space-y-6",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-5", children: [
                /* @__PURE__ */ jsxs(
                  "div",
                  {
                    className: "rounded-2xl p-6 text-center transition-all hover:-translate-y-1",
                    style: {
                      background: "var(--bg-card)",
                      border: "1px solid var(--accent)",
                      boxShadow: "0 8px 32px var(--accent-glow)"
                    },
                    children: [
                      /* @__PURE__ */ jsx(
                        "img",
                        {
                          src: user1Data.user.avatar_url,
                          alt: user1Data.user.login,
                          className: "w-24 h-24 rounded-2xl mx-auto mb-4 object-cover",
                          style: { border: "4px solid var(--accent-soft)" }
                        }
                      ),
                      /* @__PURE__ */ jsx("h4", { className: "font-bold text-lg mb-1", style: { color: "var(--text-primary)" }, children: user1Data.user.name || user1Data.user.login }),
                      /* @__PURE__ */ jsxs("p", { className: "text-sm mb-4 font-medium", style: { color: "var(--accent)" }, children: [
                        "@",
                        user1Data.user.login
                      ] }),
                      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-2 text-center text-xs", children: [
                        /* @__PURE__ */ jsxs("div", { className: "p-2 rounded-lg bg-[var(--bg-secondary)]", children: [
                          /* @__PURE__ */ jsx("div", { className: "font-bold text-[var(--text-primary)]", children: formatNumber(user1Data.totalStars) }),
                          /* @__PURE__ */ jsx("div", { className: "text-[var(--text-muted)]", children: "Stars" })
                        ] }),
                        /* @__PURE__ */ jsxs("div", { className: "p-2 rounded-lg bg-[var(--bg-secondary)]", children: [
                          /* @__PURE__ */ jsx("div", { className: "font-bold text-[var(--text-primary)]", children: formatNumber(user1Data.user.followers) }),
                          /* @__PURE__ */ jsx("div", { className: "text-[var(--text-muted)]", children: "Followers" })
                        ] }),
                        /* @__PURE__ */ jsxs("div", { className: "p-2 rounded-lg bg-[var(--bg-secondary)]", children: [
                          /* @__PURE__ */ jsx("div", { className: "font-bold text-[var(--text-primary)]", children: formatNumber(user1Data.user.public_repos) }),
                          /* @__PURE__ */ jsx("div", { className: "text-[var(--text-muted)]", children: "Repos" })
                        ] })
                      ] })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "div",
                  {
                    className: "rounded-2xl p-6 text-center transition-all hover:-translate-y-1",
                    style: {
                      background: "var(--bg-card)",
                      border: "1px solid var(--purple)",
                      boxShadow: "0 8px 32px rgba(168, 85, 247, 0.25)"
                    },
                    children: [
                      /* @__PURE__ */ jsx(
                        "img",
                        {
                          src: user2Data.user.avatar_url,
                          alt: user2Data.user.login,
                          className: "w-24 h-24 rounded-2xl mx-auto mb-4 object-cover",
                          style: { border: "4px solid rgba(168, 85, 247, 0.12)" }
                        }
                      ),
                      /* @__PURE__ */ jsx("h4", { className: "font-bold text-lg mb-1", style: { color: "var(--text-primary)" }, children: user2Data.user.name || user2Data.user.login }),
                      /* @__PURE__ */ jsxs("p", { className: "text-sm mb-4 font-medium", style: { color: "var(--purple)" }, children: [
                        "@",
                        user2Data.user.login
                      ] }),
                      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-2 text-center text-xs", children: [
                        /* @__PURE__ */ jsxs("div", { className: "p-2 rounded-lg bg-[var(--bg-secondary)]", children: [
                          /* @__PURE__ */ jsx("div", { className: "font-bold text-[var(--text-primary)]", children: formatNumber(user2Data.totalStars) }),
                          /* @__PURE__ */ jsx("div", { className: "text-[var(--text-muted)]", children: "Stars" })
                        ] }),
                        /* @__PURE__ */ jsxs("div", { className: "p-2 rounded-lg bg-[var(--bg-secondary)]", children: [
                          /* @__PURE__ */ jsx("div", { className: "font-bold text-[var(--text-primary)]", children: formatNumber(user2Data.user.followers) }),
                          /* @__PURE__ */ jsx("div", { className: "text-[var(--text-muted)]", children: "Followers" })
                        ] }),
                        /* @__PURE__ */ jsxs("div", { className: "p-2 rounded-lg bg-[var(--bg-secondary)]", children: [
                          /* @__PURE__ */ jsx("div", { className: "font-bold text-[var(--text-primary)]", children: formatNumber(user2Data.user.public_repos) }),
                          /* @__PURE__ */ jsx("div", { className: "text-[var(--text-muted)]", children: "Repos" })
                        ] })
                      ] })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "rounded-2xl p-6",
                  style: {
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-primary)",
                    boxShadow: "0 4px 24px var(--shadow-color)"
                  },
                  children: [
                    /* @__PURE__ */ jsx("h4", { className: "text-sm font-bold uppercase tracking-wider mb-6", style: { color: "var(--text-muted)" }, children: "Head-to-Head Stats" }),
                    /* @__PURE__ */ jsx("div", { style: { height: 350 }, children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data: statsComparison, barGap: 8, margin: { top: 20, right: 30, left: 0, bottom: 5 }, children: [
                      /* @__PURE__ */ jsx(XAxis, { dataKey: "name", tick: { fill: "var(--text-secondary)", fontSize: 12 }, axisLine: false, tickLine: false, dy: 10 }),
                      /* @__PURE__ */ jsx(YAxis, { tick: { fill: "var(--text-secondary)", fontSize: 12 }, axisLine: false, tickLine: false }),
                      /* @__PURE__ */ jsx(
                        Tooltip,
                        {
                          cursor: { fill: "var(--bg-secondary)", opacity: 0.5 },
                          contentStyle: {
                            background: "var(--bg-elevated)",
                            border: "1px solid var(--border-primary)",
                            color: "var(--text-primary)",
                            borderRadius: "12px",
                            boxShadow: "0 8px 24px var(--shadow-color)"
                          }
                        }
                      ),
                      /* @__PURE__ */ jsx(Bar, { dataKey: user1Data.user.login, name: user1Data.user.login, fill: "var(--accent)", radius: [4, 4, 0, 0] }),
                      /* @__PURE__ */ jsx(Bar, { dataKey: user2Data.user.login, name: user2Data.user.login, fill: "var(--purple)", radius: [4, 4, 0, 0] }),
                      /* @__PURE__ */ jsx(Legend, { wrapperStyle: { paddingTop: "20px" } })
                    ] }) }) })
                  ]
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "flex justify-center pt-4", children: /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: clearComparison,
                  className: "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-[var(--bg-secondary)]",
                  style: { color: "var(--text-muted)", border: "1px solid var(--border-primary)" },
                  children: [
                    /* @__PURE__ */ jsx(X, { className: "w-4 h-4" }),
                    "Clear Comparison"
                  ]
                }
              ) })
            ]
          }
        ) })
      ]
    }
  );
};

const ExportPDF = ({ targetId, username }) => {
  const [exporting, setExporting] = useState(false);
  const [success, setSuccess] = useState(false);
  const handleExport = async () => {
    setExporting(true);
    setSuccess(false);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      const element = document.getElementById(targetId);
      if (!element) throw new Error("Dashboard element not found");
      const canvas = await html2canvas(element, {
        backgroundColor: "#0a0a0f",
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: 1200
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const scaledWidth = imgWidth * ratio;
      const scaledHeight = imgHeight * ratio;
      const pageHeight = pdfHeight;
      const totalPages = Math.ceil(scaledHeight / pageHeight);
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) pdf.addPage();
        const yOffset = -(page * pageHeight);
        pdf.addImage(imgData, "PNG", 0, yOffset, scaledWidth, scaledHeight);
      }
      pdf.setFontSize(8);
      pdf.setTextColor(139, 148, 158);
      pdf.text(
        `GitHub Analytics — @${username} — ${(/* @__PURE__ */ new Date()).toLocaleDateString()}`,
        pdfWidth / 2,
        pdfHeight - 5,
        { align: "center" }
      );
      pdf.save(`github-analytics-${username}.pdf`);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3e3);
    } catch (error) {
      console.error("PDF export failed:", error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  };
  return /* @__PURE__ */ jsx(
    "button",
    {
      onClick: handleExport,
      disabled: exporting,
      className: "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 disabled:opacity-70",
      style: {
        background: success ? "var(--success)" : "var(--bg-card)",
        color: success ? "white" : "var(--text-secondary)",
        border: success ? "none" : "1px solid var(--border-primary)"
      },
      children: exporting ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Loader2, { className: "w-3.5 h-3.5 animate-spin" }),
        "Exporting..."
      ] }) : success ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(CheckCircle, { className: "w-3.5 h-3.5" }),
        "Done!"
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Download, { className: "w-3.5 h-3.5" }),
        "Export PDF"
      ] })
    }
  );
};

const ErrorDisplay = ({ error, onRetry }) => {
  const [countdown, setCountdown] = useState(null);
  useEffect(() => {
    if (error.type === "rate_limit" && error.resetTime) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((error.resetTime - Date.now()) / 1e3));
        setCountdown(remaining);
        if (remaining <= 0) clearInterval(interval);
      }, 1e3);
      return () => clearInterval(interval);
    }
  }, [error]);
  const getIcon = () => {
    switch (error.type) {
      case "not_found":
        return /* @__PURE__ */ jsx(UserX, { className: "w-10 h-10" });
      case "rate_limit":
        return /* @__PURE__ */ jsx(Clock, { className: "w-10 h-10" });
      case "network":
        return /* @__PURE__ */ jsx(WifiOff, { className: "w-10 h-10" });
      default:
        return /* @__PURE__ */ jsx(AlertCircle, { className: "w-10 h-10" });
    }
  };
  const getTitle = () => {
    switch (error.type) {
      case "not_found":
        return "User Not Found";
      case "rate_limit":
        return "Rate Limit Exceeded";
      case "network":
        return "Connection Error";
      default:
        return "Something Went Wrong";
    }
  };
  const getColor = () => {
    switch (error.type) {
      case "not_found":
        return "var(--warning)";
      case "rate_limit":
        return "var(--danger)";
      case "network":
        return "var(--text-secondary)";
      default:
        return "var(--danger)";
    }
  };
  return /* @__PURE__ */ jsxs(
    motion.div,
    {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      className: "rounded-2xl p-8 md:p-12 text-center max-w-md mx-auto",
      style: {
        background: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
        boxShadow: "0 4px 24px var(--shadow-color)"
      },
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5",
            style: {
              background: `color-mix(in srgb, ${getColor()} 12%, transparent)`,
              color: getColor()
            },
            children: getIcon()
          }
        ),
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold mb-2", style: { color: "var(--text-primary)" }, children: getTitle() }),
        /* @__PURE__ */ jsx("p", { className: "text-sm mb-6 leading-relaxed", style: { color: "var(--text-secondary)" }, children: error.message }),
        error.type === "rate_limit" && countdown !== null && countdown > 0 && /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-3xl font-bold font-mono mb-1", style: { color: "var(--danger)" }, children: [
            Math.floor(countdown / 60),
            ":",
            (countdown % 60).toString().padStart(2, "0")
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs", style: { color: "var(--text-muted)" }, children: "until rate limit resets" })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: onRetry,
            className: "btn-primary inline-flex items-center gap-2 text-sm",
            children: [
              /* @__PURE__ */ jsx(RefreshCw, { className: "w-4 h-4" }),
              "Try Again"
            ]
          }
        )
      ]
    }
  );
};

const shimmer = {
  initial: { opacity: 0.5 },
  animate: { opacity: 1 },
  transition: { duration: 1.5, repeat: Infinity, repeatType: "reverse" }
};
const cardStyle = {
  background: "var(--bg-card)",
  border: "1px solid var(--border-primary)",
  borderRadius: "16px"
};
const ProfileSkeleton = () => /* @__PURE__ */ jsx("div", { className: "p-6 md:p-8", style: cardStyle, children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-center sm:items-start gap-6", children: [
  /* @__PURE__ */ jsx(motion.div, { ...shimmer, className: "skeleton w-28 h-28 rounded-2xl" }),
  /* @__PURE__ */ jsxs("div", { className: "flex-1 space-y-3 text-center sm:text-left w-full", children: [
    /* @__PURE__ */ jsx(motion.div, { ...shimmer, className: "skeleton h-7 w-48 mx-auto sm:mx-0 rounded-lg" }),
    /* @__PURE__ */ jsx(motion.div, { ...shimmer, className: "skeleton h-4 w-64 mx-auto sm:mx-0 rounded-lg" }),
    /* @__PURE__ */ jsx(motion.div, { ...shimmer, className: "skeleton h-4 w-56 mx-auto sm:mx-0 rounded-lg" }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-3 justify-center sm:justify-start", children: [
      /* @__PURE__ */ jsx(motion.div, { ...shimmer, className: "skeleton h-4 w-20 rounded-lg" }),
      /* @__PURE__ */ jsx(motion.div, { ...shimmer, className: "skeleton h-4 w-20 rounded-lg" })
    ] })
  ] })
] }) });
const StatsSkeleton = () => /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3", children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ jsxs("div", { className: "p-5 text-center", style: cardStyle, children: [
  /* @__PURE__ */ jsx(motion.div, { ...shimmer, className: "skeleton w-10 h-10 rounded-xl mx-auto mb-3" }),
  /* @__PURE__ */ jsx(motion.div, { ...shimmer, className: "skeleton h-6 w-16 mx-auto mb-1 rounded-lg" }),
  /* @__PURE__ */ jsx(motion.div, { ...shimmer, className: "skeleton h-3 w-20 mx-auto rounded-lg" })
] }, i)) });
const ChartSkeleton = () => /* @__PURE__ */ jsxs("div", { className: "p-6", style: cardStyle, children: [
  /* @__PURE__ */ jsx(motion.div, { ...shimmer, className: "skeleton h-4 w-40 mb-5 rounded-lg" }),
  /* @__PURE__ */ jsxs("div", { className: "flex flex-col lg:flex-row items-center gap-6", children: [
    /* @__PURE__ */ jsx(motion.div, { ...shimmer, className: "skeleton w-[180px] h-[180px] rounded-full mx-auto" }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 grid grid-cols-2 gap-2 w-full", children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ jsx(motion.div, { ...shimmer, className: "skeleton h-10 rounded-lg" }, i)) })
  ] })
] });
const ReposSkeleton = () => /* @__PURE__ */ jsxs("div", { children: [
  /* @__PURE__ */ jsx(motion.div, { ...shimmer, className: "skeleton h-4 w-40 mb-4 rounded-lg" }),
  /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3", children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ jsxs("div", { className: "p-5", style: cardStyle, children: [
    /* @__PURE__ */ jsx(motion.div, { ...shimmer, className: "skeleton h-5 w-32 mb-3 rounded-lg" }),
    /* @__PURE__ */ jsx(motion.div, { ...shimmer, className: "skeleton h-4 w-full mb-2 rounded-lg" }),
    /* @__PURE__ */ jsx(motion.div, { ...shimmer, className: "skeleton h-4 w-3/4 mb-4 rounded-lg" }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
      /* @__PURE__ */ jsx(motion.div, { ...shimmer, className: "skeleton h-3 w-16 rounded-lg" }),
      /* @__PURE__ */ jsx(motion.div, { ...shimmer, className: "skeleton h-3 w-12 rounded-lg" }),
      /* @__PURE__ */ jsx(motion.div, { ...shimmer, className: "skeleton h-3 w-12 rounded-lg" })
    ] })
  ] }, i)) })
] });
const HeatmapSkeleton = () => /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
  /* @__PURE__ */ jsx(motion.div, { ...shimmer, className: "skeleton h-5 w-64 rounded-lg" }),
  /* @__PURE__ */ jsxs("div", { className: "flex flex-col lg:flex-row gap-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex-1 p-6", style: cardStyle, children: [
      /* @__PURE__ */ jsx(motion.div, { ...shimmer, className: "skeleton h-[110px] w-full rounded-lg" }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between mt-4", children: [
        /* @__PURE__ */ jsx(motion.div, { ...shimmer, className: "skeleton h-3 w-48 rounded-lg" }),
        /* @__PURE__ */ jsx(motion.div, { ...shimmer, className: "skeleton h-3 w-32 rounded-lg" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "hidden lg:flex flex-col gap-1 w-28", children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ jsx(motion.div, { ...shimmer, className: "skeleton h-9 w-full rounded-md" }, i)) })
  ] })
] });

function useGitHubData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fetchData = useCallback(async (username) => {
    if (!username.trim()) return;
    const cacheKey = `github_data_${username.toLowerCase()}`;
    const cachedData = sessionStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        setData(parsed);
        setError(null);
        return;
      } catch (e) {
        console.error("Failed to parse cached data", e);
        sessionStorage.removeItem(cacheKey);
      }
    }
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const [user, repos, events] = await Promise.all([
        fetchUserProfile(username),
        fetchUserRepos(username),
        fetchUserEvents(username)
      ]);
      const topRepos = getTopRepos(repos);
      const languageStats = processLanguageStats(repos);
      const stats = calculateTotalStats(repos);
      const contributionData = processContributionData(events);
      const result = {
        user,
        repos,
        topRepos,
        languageStats,
        ...stats,
        contributionData
      };
      setData(result);
      sessionStorage.setItem(cacheKey, JSON.stringify(result));
    } catch (err) {
      if (err.type) {
        setError(err);
      } else {
        setError({
          type: "network",
          message: "Network error. Please check your connection and try again."
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);
  const clearData = useCallback(() => {
    setData(null);
    setError(null);
  }, []);
  return { data, loading, error, fetchData, clearData };
}

const GitHubDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchedUsername, setSearchedUsername] = useState("");
  const { data, loading, error, fetchData} = useGitHubData();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userParam = params.get("user");
    if (userParam) {
      setSearchedUsername(userParam);
      fetchData(userParam);
    }
  }, []);
  const handleSearch = useCallback(
    (username) => {
      setSearchedUsername(username);
      fetchData(username);
      const url = new URL(window.location.href);
      url.searchParams.set("user", username);
      window.history.pushState({}, "", url.toString());
    },
    [fetchData]
  );
  const handleRetry = () => {
    if (searchedUsername) fetchData(searchedUsername);
  };
  const tabs = [
    { key: "dashboard", label: "Dashboard", icon: /* @__PURE__ */ jsx(LayoutDashboard, { className: "w-4 h-4" }) },
    { key: "compare", label: "Compare", icon: /* @__PURE__ */ jsx(GitCompareArrows, { className: "w-4 h-4" }) }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pb-16", children: [
    /* @__PURE__ */ jsx(Header, {}),
    /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, delay: 0.1 },
        className: "text-center mt-12 mb-16 lg:mt-20 lg:mb-24",
        children: [
          /* @__PURE__ */ jsxs(
            motion.div,
            {
              initial: { opacity: 0, scale: 0.8 },
              animate: { opacity: 1, scale: 1 },
              transition: { delay: 0.2, type: "spring" },
              className: "inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-bold mb-8",
              style: {
                background: "var(--accent-soft)",
                color: "var(--accent)",
                border: "1px solid var(--accent-glow)"
              },
              children: [
                /* @__PURE__ */ jsx("div", { className: "w-3.5 h-3.5", children: "🔥" }),
                "Created by confidence boba.dev"
              ]
            }
          ),
          /* @__PURE__ */ jsxs("h2", { className: "text-4xl sm:text-5xl md:text-6xl 2xl:text-7xl font-black mb-6 leading-[1.1] tracking-tight", children: [
            /* @__PURE__ */ jsx("span", { className: "gradient-text", children: "Discover" }),
            " ",
            /* @__PURE__ */ jsx("span", { style: { color: "var(--text-primary)" }, children: "GitHub Insights" })
          ] }),
          /* @__PURE__ */ jsx(
            "p",
            {
              className: "text-sm sm:text-base lg:text-lg 2xl:text-xl max-w-2xl mx-auto mb-10 leading-relaxed opacity-90",
              style: { color: "var(--text-secondary)" },
              children: "Explore detailed analytics, language distributions, top repositories, and activity patterns for any GitHub profile with our modern, high-performance dashboard."
            }
          ),
          /* @__PURE__ */ jsx(SearchBar, { onSearch: handleSearch, loading, initialValue: searchedUsername })
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "flex items-center justify-center gap-1 mb-8 p-1.5 rounded-xl max-w-xs mx-auto",
        style: { background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)" },
        children: tabs.map((tab) => /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setActiveTab(tab.key),
            className: `tab-pill flex items-center gap-2 flex-1 justify-center ${activeTab === tab.key ? "active" : ""}`,
            children: [
              tab.icon,
              tab.label
            ]
          },
          tab.key
        ))
      }
    ),
    data && activeTab === "dashboard" && /* @__PURE__ */ jsx("div", { className: "flex justify-end mb-4", children: /* @__PURE__ */ jsx(motion.div, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, children: /* @__PURE__ */ jsx(ExportPDF, { targetId: "dashboard-content", username: searchedUsername }) }) }),
    /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: activeTab === "dashboard" ? /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        id: "dashboard-content",
        children: [
          loading && /* @__PURE__ */ jsxs("div", { className: "space-y-8 lg:space-y-12", children: [
            /* @__PURE__ */ jsx(ProfileSkeleton, {}),
            /* @__PURE__ */ jsx(StatsSkeleton, {}),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 mb-5", children: [
              /* @__PURE__ */ jsx(ChartSkeleton, {}),
              /* @__PURE__ */ jsx("div", { className: "hidden lg:block" })
            ] }),
            /* @__PURE__ */ jsx(HeatmapSkeleton, {}),
            /* @__PURE__ */ jsx(ReposSkeleton, {})
          ] }),
          error && /* @__PURE__ */ jsx(ErrorDisplay, { error, onRetry: handleRetry }),
          data && data.user && /* @__PURE__ */ jsxs(
            motion.div,
            {
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              transition: { duration: 0.4 },
              className: "space-y-8 lg:space-y-12",
              children: [
                /* @__PURE__ */ jsx(ProfileCard, { user: data.user }),
                /* @__PURE__ */ jsx(
                  StatsCards,
                  {
                    totalRepos: data.user.public_repos,
                    totalStars: data.totalStars,
                    totalForks: data.totalForks,
                    followers: data.user.followers,
                    totalWatchers: data.totalWatchers,
                    publicGists: data.user.public_gists
                  }
                ),
                /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10", children: /* @__PURE__ */ jsx(LanguageChart, { data: data.languageStats }) }),
                /* @__PURE__ */ jsx(ActivityHeatmap, { data: data.contributionData }),
                /* @__PURE__ */ jsx(TopRepos, { repos: data.topRepos })
              ]
            }
          ),
          !loading && !error && !data && /* @__PURE__ */ jsxs(
            motion.div,
            {
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              transition: { delay: 0.3 },
              className: "text-center py-24",
              children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-float",
                    style: {
                      background: "var(--accent-soft)",
                      border: "1px solid var(--accent-glow)"
                    },
                    children: /* @__PURE__ */ jsx(Github, { className: "w-10 h-10", style: { color: "var(--accent)" } })
                  }
                ),
                /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold mb-2", style: { color: "var(--text-primary)" }, children: "Ready to Explore" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm max-w-sm mx-auto mb-6", style: { color: "var(--text-secondary)" }, children: "Search for a GitHub username to view their profile analytics and insights." }),
                /* @__PURE__ */ jsx("div", { className: "flex flex-wrap justify-center gap-2", children: ["torvalds", "gaearon", "sindresorhus", "tj"].map((name) => /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => handleSearch(name),
                    className: "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
                    style: {
                      background: "var(--bg-card)",
                      color: "var(--text-secondary)",
                      border: "1px solid var(--border-primary)"
                    },
                    onMouseEnter: (e) => {
                      e.currentTarget.style.borderColor = "var(--accent)";
                      e.currentTarget.style.color = "var(--accent)";
                    },
                    onMouseLeave: (e) => {
                      e.currentTarget.style.borderColor = "var(--border-primary)";
                      e.currentTarget.style.color = "var(--text-secondary)";
                    },
                    children: [
                      "@",
                      name
                    ]
                  },
                  name
                )) })
              ]
            }
          )
        ]
      },
      "dashboard"
    ) : /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        children: /* @__PURE__ */ jsx(CompareUsers, {})
      },
      "compare"
    ) }),
    /* @__PURE__ */ jsxs(
      "footer",
      {
        className: "text-center mt-20 pt-8 text-xs",
        style: { borderTop: "1px solid var(--border-subtle)", color: "var(--text-muted)" },
        children: [
          /* @__PURE__ */ jsxs("p", { children: [
            "Built with",
            " ",
            /* @__PURE__ */ jsx("span", { style: { color: "var(--accent)" }, children: "Astro" }),
            " +",
            " ",
            /* @__PURE__ */ jsx("span", { style: { color: "var(--purple)" }, children: "React" }),
            " +",
            " ",
            /* @__PURE__ */ jsx("span", { style: { color: "var(--pink)" }, children: "Recharts" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 opacity-50", children: "Data from GitHub REST API • Not affiliated with GitHub" })
        ]
      }
    )
  ] });
};

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "GitHubDashboard", GitHubDashboard, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/boba/Projects/Github Analytics Generator/src/components/GitHubDashboard", "client:component-export": "GitHubDashboard" })} ` })}`;
}, "/home/boba/Projects/Github Analytics Generator/src/pages/index.astro", void 0);

const $$file = "/home/boba/Projects/Github Analytics Generator/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Index,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
