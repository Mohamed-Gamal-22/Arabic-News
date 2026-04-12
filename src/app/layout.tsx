import type { Metadata } from "next";
import type { Session } from "next-auth";
import { Cairo, Noto_Sans_Arabic } from "next/font/google";
import { getServerSession } from "next-auth/next";
import "./globals.css";
// import "@/lib/fontawesome";
import AuthProvider from "@/components/AuthProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { authOptions } from "@/lib/auth";
import { getCategoriesServer } from "@/lib/categories";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-noto-sans-arabic",
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: "موقع الأخبار العربية",
  description: "موقع إخباري شامل للأخبار العربية والعالمية",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // جلب التصنيفات في الـ server
  const categories = await getCategoriesServer();
  // next-auth: extended Session/callbacks vs default AuthOptions typing
  const session = (await getServerSession(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    authOptions as any
  )) as Session | null;

  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${cairo.variable} ${notoSansArabic.variable} antialiased`}
      >
        <AuthProvider session={session}>
          <Header categories={categories} session={session} />
          <main className="min-w-0 overflow-x-hidden">{children}</main>
          <Footer categories={categories.map(cat => ({
            id: typeof cat.id === 'string' ? parseInt(cat.id, 10) : (typeof cat.id === 'number' ? cat.id : 0),
            name: cat.name,
            slug: cat.slug,
            parentId: cat.parentId ?? null,
          }))} />
        </AuthProvider>
      </body>
    </html>
  );
}
