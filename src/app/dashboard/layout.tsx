import AuthProvider from "@/components/AuthProvider";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <main>{children}</main>
    </AuthProvider>
  );
}
