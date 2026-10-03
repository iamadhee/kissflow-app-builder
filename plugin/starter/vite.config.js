import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import Pages from "vite-plugin-pages";
import path from "node:path";
import { writeFileSync } from "node:fs";

import { kfLiveProxy } from "./vite-kf-live.js";
import { kfLegacyImports } from "./kf-legacy-imports.js";

export default defineConfig({
  plugins: [
    // components/kf was merged into components/kit; every application generated against the old
    // two folders still resolves. Before react() and before the "@" alias: the mapping has to see
    // the specifier the author actually wrote.
    kfLegacyImports({ kitDir: path.resolve(__dirname, "src/components/kit") }),
    react(),
    // Tailwind v4 — configured entirely in src/shadcn.css (no tailwind.config.js /
    // postcss.config.js). Replaces the v3 postcss `tailwindcss` + `autoprefixer` pair;
    // v4 prefixes via Lightning CSS on its own.
    tailwindcss(),
    // src/pages/**.jsx → routes. e.g. src/pages/items/[id].jsx → /items/:id
    Pages({ dirs: "src/pages" }),
    // /__kf/* → real Kissflow REST (admin key attached server-side). Dev only;
    // enables live data when starter/.env has KF_* keys.
    kfLiveProxy(),
    {
      // THE STYLES HAVE TO RIDE IN THE SCRIPT.
      //
      // Vite emits CSS as its own asset and links it from dist/index.html. Kissflow never loads that
      // html: the custom component manifest points at scripts.web — ONE JavaScript file — and carries
      // no styles key at all. So the stylesheet was built, packed into the zip, uploaded, and then
      // never fetched by anything.
      //
      // The result was an app with every class on every element and not one of them resolving:
      // correct DOM, correct content, browser default styling. Nothing in generation was wrong, which
      // is why it survived so long — the agents produced the right thing and packaging dropped it at
      // the last step. (Reported from a live app, 2026-08-10, against a prototype that looked right
      // because a single self-contained file has nothing to link.)
      //
      // Inlining rather than declaring the CSS in the manifest, deliberately: a bundle that carries
      // its own styles is correct however it gets mounted, and does not depend on a second field
      // being read by whatever loads it.
      name: "kf-inline-css",
      apply: "build",          // dev serves CSS through the module graph already
      enforce: "post",         // after Vite has emitted the css assets
      generateBundle(_options, bundle) {
        const cssFiles = Object.keys(bundle).filter((f) => f.endsWith(".css") && bundle[f].type === "asset");
        if (!cssFiles.length) return;
        const entry = Object.values(bundle).find((c) => c.type === "chunk" && c.isEntry);
        if (!entry) { this.warn("kf-inline-css: no entry chunk — styles left as a separate asset"); return; }
        const css = cssFiles.map((f) => String(bundle[f].source)).join("\n");
        // JSON.stringify does the escaping, so a stylesheet containing quotes, newlines or a </script>
        // cannot break out of the string it is carried in.
        entry.code =
          `(function(){try{var s=document.createElement("style");s.setAttribute("data-kf-ui","");` +
          `s.textContent=${JSON.stringify(css)};document.head.appendChild(s)}catch(e){}})();\n` +
          entry.code;
        // Drop the now-unreferenced files. Leaving them would ship the whole stylesheet twice and
        // invite somebody to "fix" the missing link by pointing at a file nothing reads.
        for (const f of cssFiles) delete bundle[f];
        // …and take the <link> with them. Deleting the asset while index.html still points at it
        // trades a missing stylesheet for a 404 on every load — the page would look right, because
        // the script has the styles, and the network tab would say something is broken.
        const html = bundle["index.html"];
        if (html && html.type === "asset") {
          const names = new Set(cssFiles.map((f) => f.split("/").pop()));
          html.source = String(html.source).replace(
            /<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi,
            (tag) => {
              const href = (tag.match(/href=["']([^"']+)["']/) || [])[1] || "";
              return names.has(href.split("/").pop()) ? "" : tag;   // leave the font link alone
            },
          );
        }
      },
    },
    {
      // SINGLE-FILE PROTOTYPE. When KF_PROTO_SINGLEFILE is set (proto-react.mjs's build), inline the
      // entry chunk INTO index.html and drop the external <script src>, so the prototype is ONE
      // self-contained file — which is exactly what the chat's publish path reads (chat/app.mjs
      // reads a single prototype/index.html). Gated by the env var, so the normal ship build (which
      // mounts as a multi-file custom component in Kissflow) is byte-for-byte unchanged. Pairs with
      // build.rollupOptions.output.inlineDynamicImports below, which collapses the code-split routes
      // into that one entry chunk so there is nothing left to reference.
      name: "kf-single-file",
      apply: "build",
      enforce: "post",          // after kf-inline-css has folded the CSS into entry.code
      generateBundle(_options, bundle) {
        if (!process.env.KF_PROTO_SINGLEFILE) return;
        const html = bundle["index.html"];
        const entry = Object.values(bundle).find((c) => c.type === "chunk" && c.isEntry);
        if (!html || html.type !== "asset" || !entry) return;
        // Two fixes on the inlined code:
        // 1. `__VITE_PRELOAD__` is injected by vite's build import-analysis AFTER esbuild/define, and
        //    with everything in one chunk there are no cross-chunk deps to preload — left as-is it is
        //    an undefined reference that throws at runtime. Neutralize it to `void 0` (no deps).
        // 2. A literal </script> anywhere (e.g. inside the CSS string kf-inline-css embedded) would
        //    close the inline tag early, so escape it. (A separate .js file can't hit either.)
        const code = String(entry.code)
          .replace(/\b__VITE_PRELOAD__\b/g, "void 0")
          .replace(/<\/script>/gi, "<\\/script>");
        const entryName = entry.fileName.split("/").pop();
        html.source = String(html.source).replace(
          /<script\b[^>]*\bsrc=["'][^"']*["'][^>]*><\/script>/gi,
          (tag) => {
            const src = (tag.match(/src=["']([^"']+)["']/) || [])[1] || "";
            return src.split("/").pop() === entryName ? `<script type="module">${code}</script>` : tag;
          },
        );
        delete bundle[entry.fileName]; // it now lives inside index.html
      },
    },
    {
      name: "emit-kf-manifest",
      writeBundle() {
        writeFileSync(
          path.resolve(__dirname, "dist/manifest.json"),
          JSON.stringify({ Category: "Page", Framework: "React" }, null, 2),
        );
      },
    },
  ],
  // Relative asset paths so the built bundle works from a zip or any mount point.
  base: "",
  // Force a single copy of react / react-router so @kissflow/app-ui's MemoryRouter
  // and your pages' hooks share one RouterContext (otherwise the production build
  // bundles two copies → "Cannot destructure property 'future' of … null").
  resolve: {
    dedupe: ["react", "react-dom", "react-router-dom"],
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  // inlineDynamicImports (single chunk) ONLY for the single-file prototype build — collapses the
  // code-split routes into the entry so kf-single-file has one chunk to inline. modulePreload:false
  // drops vite's cross-chunk preload helper (there are no other chunks to preload), which otherwise
  // leaves an unsubstituted `__VITE_PRELOAD__` reference that throws at runtime. Normal build: default.
  build: {
    target: "es2022",
    // CSS is folded into the entry script for deployed apps and into index.html for prototypes.
    // A separately emitted font file would have no stable URL in either one-payload format, so
    // self-hosted theme fonts must travel as data URLs. Leave every other asset on Vite's normal
    // threshold; this is deliberately a font-only packaging rule, not a blanket bundle-size change.
    assetsInlineLimit(filePath) {
      return /\.(?:woff2?|ttf|otf)$/i.test(filePath) ? true : undefined;
    },
    // Nobody reads the gzip column on a generated build, and measuring it costs real seconds on a
    // half-megabyte single-file bundle — pure latency on the express preview path.
    reportCompressedSize: false,
    // ONE stylesheet for the whole app. kf-inline-css folds it into the entry chunk and deletes the
    // .css files; with per-chunk CSS, lazily loaded route chunks still asked Vite to preload their
    // (deleted) CSS and the route failed with "Unable to preload CSS". A single stylesheet leaves the
    // lazy chunks with no CSS dependencies at all.
    cssCodeSplit: false,
    ...(process.env.KF_PROTO_SINGLEFILE
      ? { modulePreload: false, rollupOptions: { output: { inlineDynamicImports: true } } }
      : {}),
  },
  server: {
    port: 3000,
    host: "0.0.0.0",
    // HTTPS so the Kissflow (https) shell can iframe this without mixed-content blocks.
    https: {
      cert: path.resolve("./cert/localhost.crt"),
      key: path.resolve("./cert/localhost.key"),
    },
  },
});
