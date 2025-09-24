"use client";
import { createContext, useContext } from "react";
import ErrorComponent from "@/components/Error";
import LoadingComponent from "@/components/Loading";
import { trpc } from "@/lib/trpc/client";
import { User } from "@/lib/db/schema";


export type UserWithoutPassword = Omit<User, "password">;

const SessionContext = createContext<UserWithoutPassword | null>(null)

export const useSession = () => {
    const context = useContext(SessionContext)
    if (context === undefined) {
        throw new Error("useSession must be used within a SessionProvider");
    }
    return context
}

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
    const { data: sessionData, isPending, error, refetch } = trpc.user.session.useQuery()


    if (isPending) {
        return <LoadingComponent />
    }

    if (error) {
        return <ErrorComponent onTryAgain={refetch} />
    }

    return (
        <SessionContext.Provider value={sessionData?.user || null}>
            {children}
        </SessionContext.Provider>
    )
}