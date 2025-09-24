export const API_URL = process.env.NODE_ENV === "development" ?  "http://localhost:3000" : "https://video-platform-beryl.vercel.app/";
export const TRPC_URL = `${API_URL}/api/trpc`;