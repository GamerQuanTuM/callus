export const API_URL = process.env.NODE_ENV === "development" ?  "http://localhost:3000" : "https://your-production-url.com";
export const TRPC_URL = `${API_URL}/api/trpc`;