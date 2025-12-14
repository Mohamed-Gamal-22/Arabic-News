"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      } else if (result?.ok) {
        // الحصول على الجلسة لتحديد الدور
        const session = await getSession();
        // Type assertion needed because getSession() doesn't use the extended types
        const role = (session?.user as { role?: string } | undefined)?.role;

        if (role) {
          // توجيه المستخدم حسب دوره
          switch (role) {
            case "writer":
              router.push("/dashboard/writer");
              break;
            case "admin":
              router.push("/dashboard/admin");
              break;
            case "super_admin":
              router.push("/dashboard/super-admin");
              break;
            default:
              router.push("/dashboard");
          }
        } else {
          router.push("/dashboard");
        }
      } else {
        setError("حدث خطأ في تسجيل الدخول");
      }
    } catch (error: unknown) {
      console.error("خطأ في تسجيل الدخول:", error);
      setError("حدث خطأ في تسجيل الدخول");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">أ</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold arabic-heading">
            تسجيل الدخول
          </CardTitle>
          <CardDescription className="arabic-text">
            أدخل بياناتك للوصول إلى الداشبورد
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg arabic-text">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="arabic-text">
                البريد الإلكتروني
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="أدخل بريدك الإلكتروني"
                className="arabic-text"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="arabic-text">
                كلمة المرور
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="أدخل كلمة المرور"
                  className="arabic-text"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? "إخفاء" : "إظهار"}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
