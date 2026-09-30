import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");

    return {
        plugins: [react()],
        server: {
            port: 5173,
            // Same-origin API in dev: /api/* is forwarded to the backend
            proxy: {
                "/api": {
                    target: env.VITE_PROXY_TARGET || "http://localhost:5000",
                    changeOrigin: true
                }
            }
        }
    };
});
