"use client";

import React, { useState } from "react";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { QueryClientProvider } from "@tanstack/react-query";
import superJSON from "superjson";
import getQueryClient, { trpc } from "./client";
import type { AppRouter } from "./routers";

export default function TRPCProvider({ children }: { children: React.ReactNode }) {
    // NOTE: Avoid useState when initializing the query client if you don't
    //       have a suspense boundary between this and the code that may
    //       suspend because React will throw away the client on the initial
    //       render if it suspends and there is no boundary
    const queryClient = getQueryClient();


    const [trpcClient] = useState(() => createTRPCProxyClient<AppRouter>({
        links: [httpBatchLink({
            url: "/api/trpc", transformer: superJSON,
            headers: () => {
                return typeof window !== 'undefined' ? {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
                } : {};
            },
        })],
    }))


    const TrpcProvider = trpc.Provider;

    return (
        <TrpcProvider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </TrpcProvider>
    )
}
