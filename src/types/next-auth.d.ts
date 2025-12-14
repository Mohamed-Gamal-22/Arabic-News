// import NextAuth from "next-auth"; // unused
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      categories?: unknown;
      categoryIds?: unknown;
    };
    accessToken: string;
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    token: string;
    categories?: unknown;
    categoryIds?: unknown;
  }
}

declare module "next-auth/react" {
  import { ComponentType, ReactNode } from "react";
  import { Session } from "next-auth";

  export function useSession(): {
    data: Session | null;
    status: "loading" | "authenticated" | "unauthenticated";
  };

  export function signIn(
    provider?: string,
    options?: { email?: string; password?: string; redirect?: boolean }
  ): Promise<{ error?: string; ok?: boolean } | undefined>;

  export function getSession(): Promise<Session | null>;

  export function signOut(options?: {
    redirect?: boolean;
    callbackUrl?: string;
  }): Promise<void>;

  export interface SessionProviderProps {
    children: ReactNode;
    session?: Session | null;
    basePath?: string;
    refetchInterval?: number;
    refetchOnWindowFocus?: boolean;
  }

  export const SessionProvider: ComponentType<SessionProviderProps>;

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      categories?: unknown;
      categoryIds?: unknown;
    };
    accessToken: string;
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    token: string;
    categories?: unknown;
    categoryIds?: unknown;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    accessToken: string;
    categories?: unknown;
    categoryIds?: unknown;
  }
}
