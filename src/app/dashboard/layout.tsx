import AuthProvider from "@/components/AuthProvider";
import Header from "@/components/Header";
import { getCategoriesServer } from "@/lib/categories";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // جلب التصنيفات في الـ server
  const categories = await getCategoriesServer();

  return (
    <AuthProvider>
      <Header categories={categories} />
      <main>{children}</main>
    </AuthProvider>
  );
}
