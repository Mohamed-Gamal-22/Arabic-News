"use client";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import { ReactNode } from "react";
import { UserProvider } from "@/contexts/UserContext";

interface AuthProviderProps {
  children: ReactNode;
  /** يُمرَّر من الخادم ليتطابق HTML الأولي مع حالة الجلسة على العميل (تفادي أخطاء hydration). */
  session?: Session | null;
}

export default function AuthProvider({ children, session }: AuthProviderProps) {
  return (
    <SessionProvider
      session={session ?? undefined}
      refetchOnWindowFocus={false}
    >
      <UserProvider>{children}</UserProvider>
    </SessionProvider>
  );
}



















