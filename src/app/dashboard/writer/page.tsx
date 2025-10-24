"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LogoutButton from "@/components/LogoutButton";

export default function WriterDashboard() {
  const [articles] = useState([
    {
      id: "1",
      title: "تطورات جديدة في الأزمة السياسية",
      status: "published",
      publishDate: "2024-01-15",
      views: 1250,
    },
    {
      id: "2",
      title: "ارتفاع أسعار النفط يؤثر على الاقتصاد",
      status: "pending",
      publishDate: "2024-01-14",
      views: 0,
    },
    {
      id: "3",
      title: "فوز فريق كرة القدم الوطني",
      status: "draft",
      publishDate: "2024-01-13",
      views: 0,
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "published":
        return "منشور";
      case "pending":
        return "في الانتظار";
      case "draft":
        return "مسودة";
      case "rejected":
        return "مرفوض";
      default:
        return "غير معروف";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* الهيدر */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">أ</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white arabic-heading">
                داشبورد الكاتب
              </h1>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                إجمالي المقالات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                المقالات المنشورة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">8</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                في الانتظار
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">2</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                المسودات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">2</div>
            </CardContent>
          </Card>
        </div>

        {/* الإجراءات السريعة */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="arabic-heading">
                الإجراءات السريعة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4 space-x-reverse">
                <Button asChild>
                  <Link href="/dashboard/writer/create">إنشاء مقالة جديدة</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/writer/articles">
                    عرض جميع المقالات
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* المقالات الأخيرة */}
        <Card>
          <CardHeader>
            <CardTitle className="arabic-heading">المقالات الأخيرة</CardTitle>
            <CardDescription className="arabic-text">
              آخر المقالات التي قمت بإنشائها
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {articles.map((article) => (
                <div
                  key={article.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white arabic-heading">
                      {article.title}
                    </h3>
                    <div className="flex items-center space-x-4 space-x-reverse mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>📅 {article.publishDate}</span>
                      <span>👁️ {article.views} مشاهدة</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        article.status
                      )}`}
                    >
                      {getStatusText(article.status)}
                    </span>
                    <Button variant="outline" size="sm">
                      تعديل
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}



