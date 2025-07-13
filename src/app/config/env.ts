// Environment configuration
export const env = {
  // Application settings
  NODE_ENV: import.meta.env.MODE || "development",

  // API configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",

  // Feature flags
  ENABLE_DEBUG: import.meta.env.DEV || false,

  // Application metadata
  APP_NAME: "Parrotly",
  APP_VERSION: "1.0.0",
} as const;

export type Environment = typeof env;
