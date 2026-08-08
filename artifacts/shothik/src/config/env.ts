export const ENV = {
  api_url: import.meta.env.VITE_API_URL || "",
  app_url: import.meta.env.VITE_APP_URL || "",
  convex_url: import.meta.env.VITE_CONVEX_URL || "",
  writing_studio_api_url: import.meta.env.VITE_WRITING_STUDIO_API_URL || import.meta.env.VITE_API_URL || "",
  writing_studio_enabled: (import.meta.env.VITE_WRITING_STUDIO_ENABLED || "true") === "true",
  paraphrase_socket_url: import.meta.env.VITE_PARAPHRASE_SOCKET_URL || "",
  paraphrase_redirect_prefix: import.meta.env.VITE_PARAPHRASE_REDIRECT_PREFIX || "paraphrase",
};
