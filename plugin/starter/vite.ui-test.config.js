import baseConfig from "./vite.config.js";

// Browser-friendly offline preview. The normal Vite config keeps HTTPS enabled
// for Kissflow iframe embedding; this local-only mode avoids certificate setup.
export default {
  ...baseConfig,
  define: {
    ...(baseConfig.define || {}),
    "import.meta.env.KF_UI_TEST": JSON.stringify("true"),
  },
  server: {
    ...baseConfig.server,
    host: "127.0.0.1",
    port: 4311,
    https: false,
  },
};
