"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "CredentialsSignin":
        return "البريد الإلكتروني أو كلمة المرور غير صحيحة";
      case "CallbackRouteError":
        return "حدث خطأ في تسجيل الدخول";
      case "AccessDenied":
        return "ليس لديك صلاحية للوصول إلى هذه الصفحة";
      case "Verification":
        return "فشل في التحقق من البيانات";
      default:
        return "حدث خطأ غير متوقع";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">!</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold arabic-heading text-red-600">
            خطأ في تسجيل الدخول
          </CardTitle>
          <CardDescription className="arabic-text">
            {getErrorMessage(error)}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 arabic-text mb-4">
              يرجى المحاولة مرة أخرى أو التواصل مع المسؤول
            </p>
          </div>

          <div className="flex flex-col space-y-2">
            <Button asChild>
              <Link href="/auth/signin">العودة لتسجيل الدخول</Link>
            </Button>

            <Button variant="outline" asChild>
              <Link href="/">العودة للصفحة الرئيسية</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold arabic-heading">
              جاري التحميل...
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
