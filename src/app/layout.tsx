import type { Metadata } from "next";
import { Cairo, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
// import "@/lib/fontawesome";
import AuthProvider from "@/components/AuthProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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

  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${cairo.variable} ${notoSansArabic.variable} antialiased`}
      >
        <AuthProvider>
          <Header categories={categories} />
          <main>{children}</main>
          <Footer categories={categories} />
        </AuthProvider>
      </body>
    </html>
  );
}
