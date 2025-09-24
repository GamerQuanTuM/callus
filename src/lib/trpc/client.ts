import {createTRPCReact} from "@trpc/react-query"
import type {AppRouter} from "@/lib/trpc/routers"
import type { QueryClient } from "@tanstack/react-query";
import { makeQueryClient } from "./query-client";
import { TRPC_URL } from "@/constants/api";

export const trpc = createTRPCReact<AppRouter>()

let clientQueryClientSingleton: QueryClient;
export default function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  }
  // Browser: use singleton pattern to keep the same query client
  return (clientQueryClientSingleton ??= makeQueryClient());
}

