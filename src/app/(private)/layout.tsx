
import { SessionProvider } from "@/providers/session";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SessionProvider>
        {children}
      </SessionProvider>
    </>
  );

}
