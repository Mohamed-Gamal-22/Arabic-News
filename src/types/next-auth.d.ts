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

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    accessToken: string;
    categories?: unknown;
    categoryIds?: unknown;
  }
}
