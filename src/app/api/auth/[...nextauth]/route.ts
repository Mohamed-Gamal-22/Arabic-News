import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import type { NextRequest } from "next/server";

// NextAuth handler for App Router - using the correct signature
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> }
) {
  // @ts-expect-error - NextAuth type definition issue with Next.js 15
  return NextAuth(request, context, authOptions);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> }
) {
  // @ts-expect-error - NextAuth type definition issue with Next.js 15
  return NextAuth(request, context, authOptions);
}
