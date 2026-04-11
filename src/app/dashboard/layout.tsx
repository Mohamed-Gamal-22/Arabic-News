export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // الهيدر و SessionProvider موجودان في الجذر (src/app/layout.tsx)؛
  // تكرارهما هنا كان يسبب SessionProvider متداخلة وأخطاء بعد تسجيل الخروج.
  return children;
}
