// server.ts - Using your existing API_URL
import 'server-only';
import { createHydrationHelpers } from '@trpc/react-query/rsc';
import { cache } from 'react';
import { createCallerFactory, createTRPCContext } from './init';
import { makeQueryClient } from './query-client';
import { type AppRouter, appRouter } from './routers';
import { API_URL } from '@/constants/api';

export const getQueryClient = cache(makeQueryClient);

const caller = createCallerFactory(appRouter)(async () =>
  await createTRPCContext({ 
    req: new Request(API_URL) ,
  } as any)
);

export const { trpc, HydrateClient } = createHydrationHelpers<AppRouter>(
  caller,
  getQueryClient,
);
