"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination } from "@/components/ui/pagination";
import LogoutButton from "@/components/LogoutButton";
import {
  getUsers,
  deleteUser,
  updateUserRoles,
  getCategoriesWithToken,
  createCategory,
  deleteCategory,
} from "@/lib/superAdminApi";
import {
  getArticles,
  getArticleById,
  updateArticle,
  ApiArticle,
} from "@/lib/api";

export default function SuperAdminDashboard() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState<ApiArticle[]>([]);
  const [articlesPageIndex, setArticlesPageIndex] = useState(1);
  const [articlesPageSize, setArticlesPageSize] = useState(5);
  const [articlesTotal, setArticlesTotal] = useState(0);
  const [activeTab, setActiveTab] = useState<string>("articles");
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalWriters: 0,
    totalAdmins: 0,
    totalSuperAdmins: 0,
    totalArticles: 0,
    publishedArticles: 0,
    pendingArticles: 0,
    rejectedArticles: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [deleteSuccess, setDeleteSuccess] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteCancelMessage, setDeleteCancelMessage] = useState("");
  const [showDeleteResultAlert, setShowDeleteResultAlert] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [userToUpdateRole, setUserToUpdateRole] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [roleUpdateLoading, setRoleUpdateLoading] = useState(false);
  const [roleUpdateSuccess, setRoleUpdateSuccess] = useState("");
  const [roleUpdateError, setRoleUpdateError] = useState("");
  const [showRoleResultModal, setShowRoleResultModal] = useState(false);
  const [roleResultMessage, setRoleResultMessage] = useState("");
  const [roleResultType, setRoleResultType] = useState<"success" | "error">(
    "success"
  );

  // State للـ Modal إضافة كاتيجوري
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [createCategoryLoading, setCreateCategoryLoading] = useState(false);
  const [showCategoryResultModal, setShowCategoryResultModal] = useState(false);
  const [categoryResultMessage, setCategoryResultMessage] = useState("");
  const [categoryResultType, setCategoryResultType] = useState<
    "success" | "error"
  >("success");
  const [newCategoryData, setNewCategoryData] = useState({
    Name: "",
    Slug: "",
    Description: "",
    ParentId: null as number | null,
  });

  // State للـ Modal حذف كاتيجوري
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);
  const [deleteCategoryLoading, setDeleteCategoryLoading] = useState(false);
  const [showDeleteResultModal, setShowDeleteResultModal] = useState(false);
  const [deleteResultMessage, setDeleteResultMessage] = useState("");
  const [deleteResultType, setDeleteResultType] = useState<"success" | "error">(
    "success"
  );

  // قراءة الـ tab من URL query parameter
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["articles", "categories", "users"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    const fetchData = async () => {
      if (!session?.accessToken) return;

      try {
        setLoading(true);
        setError("");

        // جلب المستخدمين والكاتيجوريز والمقالات
        const [usersData, categoriesData, articlesData] = await Promise.all([
          getUsers(session.accessToken),
          getCategoriesWithToken(session.accessToken),
          getArticles(
            articlesPageIndex,
            articlesPageSize,
            undefined,
            session.accessToken
          ),
        ]);

        setUsers(usersData);
        setCategories(categoriesData);

        // استخدام pageIndex من response، لكن نستخدم pageSize الذي أرسلناه (5)
        setArticlesPageIndex(articlesData.pageIndex || articlesPageIndex);
        // لا نحدث pageSize من response - نستخدم القيمة التي أرسلناها (5)
        setArticlesTotal(articlesData.totalCount || 0);
        setArticles(articlesData.data || []);

        console.log("=== Articles API Response ===");
        console.log("PageIndex sent:", articlesPageIndex);
        console.log("PageSize sent:", articlesPageSize);
        console.log("PageIndex from API:", articlesData.pageIndex);
        console.log("PageSize from API:", articlesData.pageSize);
        console.log("Total Count:", articlesData.totalCount);
        console.log("Articles in this page:", articlesData.data?.length || 0);
        console.log(
          "Total Pages:",
          Math.ceil(articlesData.totalCount / articlesPageSize)
        );

        // حساب الإحصائيات من البيانات المسترجعة
        const stats = {
          totalUsers: usersData.length,
          totalWriters: usersData.filter(
            (user: any) => user.roles && user.roles.includes("User")
          ).length,
          totalAdmins: usersData.filter(
            (user: any) => user.roles && user.roles.includes("Admin")
          ).length,
          totalSuperAdmins: usersData.filter(
            (user: any) => user.roles && user.roles.includes("SuperAdmin")
          ).length,
          totalArticles: articlesData.totalCount || articles.length,
          publishedArticles:
            articlesData.data?.filter((a: ApiArticle) => a.publishedAt)
              ?.length || 0,
          pendingArticles: 0, // سيتم تحديثه حسب API
          rejectedArticles: 0, // سيتم تحديثه حسب API
        };
        setSystemStats(stats);
      } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
        setError("حدث خطأ في جلب البيانات");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, articlesPageIndex, articlesPageSize]);

  // دالة لتغيير صفحة المقالات
  const handleArticlesPageChange = (newPageIndex: number) => {
    setArticlesPageIndex(newPageIndex);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // دالة لفتح modal الحذف
  const handleDeleteClick = (user: any) => {
    // فحص إذا كان المستخدم سوبر أدمن
    if (user.roles && user.roles.includes("SuperAdmin")) {
      setDeleteError("غير مسموح بحذف السوبر أدمن");
      setShowDeleteModal(true);
      setUserToDelete(null);
      return;
    }

    setUserToDelete(user);
    setShowDeleteModal(true);
    setDeleteSuccess("");
    setDeleteError("");
    setDeleteCancelMessage("");
    setShowDeleteResultAlert(false);
  };

  // دالة لفتح modal تحديث الدور
  const handleUpdateRoleClick = (user: any) => {
    // فحص إذا كان المستخدم سوبر أدمن
    if (user.roles && user.roles.includes("SuperAdmin")) {
      setRoleUpdateError("غير مسموح بتحديث دور السوبر أدمن");
      setShowRoleModal(true);
      setUserToUpdateRole(null);
      return;
    }

    setUserToUpdateRole(user);
    setSelectedRole(
      user.roles && user.roles.length > 0 ? user.roles[0] : "User"
    );
    setShowRoleModal(true);
    setRoleUpdateSuccess("");
    setRoleUpdateError("");
  };

  // دالة لتحديث دور المستخدم
  const handleUpdateUserRole = async () => {
    if (
      !session?.accessToken ||
      !userToUpdateRole ||
      !selectedRole ||
      selectedRole === ""
    ) {
      setRoleUpdateError("يجب اختيار دور");
      return;
    }

    setRoleUpdateLoading(true);
    setRoleUpdateSuccess("");
    setRoleUpdateError("");

    try {
      await updateUserRoles(
        session.accessToken,
        userToUpdateRole.id,
        selectedRole
      );
      setRoleUpdateSuccess("تم تحديث دور المستخدم بنجاح!");

      // إعادة جلب البيانات لتحديث القائمة
      const usersData = await getUsers(session.accessToken);
      setUsers(usersData);

      // إغلاق Modal التحديث وعرض Modal النتيجة
      setShowRoleModal(false);
      setUserToUpdateRole(null);
      setRoleResultMessage("تم تحديث دور المستخدم بنجاح!");
      setRoleResultType("success");
      setShowRoleResultModal(true);
    } catch (error: any) {
      console.error("خطأ في تحديث دور المستخدم:", error);

      // إغلاق Modal التحديث وعرض Modal الخطأ
      setShowRoleModal(false);
      setUserToUpdateRole(null);
      setRoleResultMessage(error.message || "حدث خطأ في تحديث دور المستخدم");
      setRoleResultType("error");
      setShowRoleResultModal(true);
    } finally {
      setRoleUpdateLoading(false);
    }
  };

  // دالة لحذف المستخدم
  const handleDeleteUser = async () => {
    if (!session?.accessToken || !userToDelete) return;

    setDeleteLoading(true);
    setDeleteSuccess("");
    setDeleteError("");
    setDeleteCancelMessage("");

    try {
      await deleteUser(session.accessToken, userToDelete.id);
      setDeleteSuccess("تم الحذف بنجاح");

      // إغلاق Modal فوراً عند النجاح
      setShowDeleteModal(false);
      setUserToDelete(null);

      // إعادة جلب البيانات لتحديث القائمة
      const usersData = await getUsers(session.accessToken);
      setUsers(usersData);

      // عرض alert النجاح
      setShowDeleteResultAlert(true);
      setTimeout(() => {
        setShowDeleteResultAlert(false);
        setDeleteSuccess("");
      }, 3000);
    } catch (error: any) {
      console.error("خطأ في حذف المستخدم:", error);
      setDeleteError(error.message || "حدث خطأ في حذف المستخدم");
    } finally {
      setDeleteLoading(false);
    }
  };

  // دالة لإلغاء الحذف
  const handleCancelDelete = () => {
    setDeleteCancelMessage("تم الإلغاء");
    setShowDeleteModal(false);
    setUserToDelete(null);
    setShowDeleteResultAlert(true);
    setTimeout(() => {
      setShowDeleteResultAlert(false);
      setDeleteCancelMessage("");
    }, 3000);
  };

  // دالة فتح Modal حذف الكاتيجوري
  const handleDeleteCategoryClick = (category: any) => {
    setCategoryToDelete(category);
    setShowDeleteCategoryModal(true);
  };

  // دالة حذف الكاتيجوري
  const handleDeleteCategory = async () => {
    if (!session?.accessToken || !categoryToDelete) return;

    try {
      setDeleteCategoryLoading(true);

      // البحث عن السابكاتيجوريز وحذفها أولاً
      const subcategories = categories.filter(
        (cat: any) => cat.parentId === categoryToDelete.id
      ) as any[];

      // حذف كل السابكاتيجوريز أولاً
      for (const subcategory of subcategories) {
        try {
          await deleteCategory(session.accessToken, subcategory.id);
          console.log(`تم حذف السابكاتيجوري: ${subcategory.name}`);
        } catch (subError) {
          console.error(
            `خطأ في حذف السابكاتيجوري ${subcategory.name}:`,
            subError
          );
          // نكمل الحذف حتى لو فشل حذف سابكاتيجوري واحد
        }
      }

      // حذف الكاتيجوري الرئيسي بعد حذف السابكاتيجوريز
      await deleteCategory(session.accessToken, categoryToDelete.id);

      // إعادة جلب البيانات لتحديث القائمة
      const categoriesData = await getCategoriesWithToken(session.accessToken);
      setCategories(categoriesData);

      // إغلاق Modal الحذف وعرض Modal النتيجة
      setShowDeleteCategoryModal(false);
      setCategoryToDelete(null);

      const deletedCount = subcategories.length;
      const message =
        deletedCount > 0
          ? `تم حذف الكاتيجوري "${categoryToDelete.name}" و ${deletedCount} سابكاتيجوري بنجاح!`
          : `تم حذف الكاتيجوري "${categoryToDelete.name}" بنجاح!`;

      setDeleteResultMessage(message);
      setDeleteResultType("success");
      setShowDeleteResultModal(true);
    } catch (error: any) {
      console.error("خطأ في حذف الكاتيجوري:", error);

      // إغلاق Modal الحذف وعرض Modal الخطأ
      setShowDeleteCategoryModal(false);
      setCategoryToDelete(null);
      setDeleteResultMessage(error.message || "حدث خطأ في حذف الكاتيجوري");
      setDeleteResultType("error");
      setShowDeleteResultModal(true);
    } finally {
      setDeleteCategoryLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!session?.accessToken) {
      setCategoryResultMessage("ليس لديك صلاحية للوصول");
      setCategoryResultType("error");
      setShowCategoryResultModal(true);
      return;
    }

    if (!newCategoryData.Name || !newCategoryData.Slug) {
      setCategoryResultMessage("الاسم والـ Slug مطلوبان");
      setCategoryResultType("error");
      setShowCategoryResultModal(true);
      return;
    }

    setCreateCategoryLoading(true);

    try {
      await createCategory(session.accessToken, newCategoryData);
      setCategoryResultMessage("تم إنشاء الكاتيجوري بنجاح!");
      setCategoryResultType("success");

      // إعادة جلب جميع التصنيفات بعد الإضافة
      console.log("=== Refreshing categories after creation ===");
      const categoriesData = await getCategoriesWithToken(session.accessToken);
      console.log("✅ Categories refreshed:", categoriesData);
      setCategories(categoriesData);

      // إعادة تعيين البيانات
      setNewCategoryData({
        Name: "",
        Slug: "",
        Description: "",
        ParentId: null,
      });

      // إغلاق Modal الإضافة وعرض Modal النتيجة
      setShowCreateCategoryModal(false);
      setShowCategoryResultModal(true);
    } catch (error: any) {
      console.error("خطأ في إنشاء الكاتيجوري:", error);
      setCategoryResultMessage(error.message || "حدث خطأ في إنشاء الكاتيجوري");
      setCategoryResultType("error");

      // إغلاق Modal الإضافة وعرض Modal الخطأ
      setShowCreateCategoryModal(false);
      setShowCategoryResultModal(true);
    } finally {
      setCreateCategoryLoading(false);
    }
  };

  const getRoleColor = (roles: string[]) => {
    if (!roles || roles.length === 0) return "bg-gray-100 text-gray-800";

    if (roles.includes("SuperAdmin")) {
      return "bg-purple-100 text-purple-800";
    } else if (roles.includes("Admin")) {
      return "bg-green-100 text-green-800";
    } else if (roles.includes("User")) {
      return "bg-blue-100 text-blue-800";
    } else {
      return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleText = (roles: string[]) => {
    if (!roles || roles.length === 0) return "غير معروف";

    if (roles.includes("SuperAdmin")) {
      return "سوبر أدمن";
    } else if (roles.includes("Admin")) {
      return "أدمن";
    } else if (roles.includes("User")) {
      return "كاتب";
    } else {
      return "غير معروف";
    }
  };

  // عرض حالة التحميل
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 arabic-text">
            جاري تحميل البيانات...
          </p>
        </div>
      </div>
    );
  }

  // عرض رسالة الخطأ
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600 arabic-heading">
              خطأ في تحميل البيانات
            </CardTitle>
            <CardDescription className="arabic-text">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()} className="w-full">
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* الهيدر */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">أ</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white arabic-heading">
                داشبورد السوبر أدمن
              </h1>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Cancel Alert */}
        {showDeleteResultAlert && (deleteSuccess || deleteCancelMessage) && (
          <div
            className={`border px-4 py-3 rounded-lg mb-6 arabic-text ${
              deleteSuccess
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-blue-50 border-blue-200 text-blue-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 space-x-reverse">
                <span
                  className={deleteSuccess ? "text-green-600" : "text-blue-600"}
                >
                  {deleteSuccess ? "✅" : "ℹ️"}
                </span>
                <span>{deleteSuccess || deleteCancelMessage}</span>
              </div>
              <button
                onClick={() => {
                  setShowDeleteResultAlert(false);
                  setDeleteSuccess("");
                  setDeleteCancelMessage("");
                }}
                className={
                  deleteSuccess
                    ? "text-green-600 hover:text-green-800"
                    : "text-blue-600 hover:text-blue-800"
                }
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* الإحصائيات العامة */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                إجمالي المستخدمين
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                إجمالي المقالات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {systemStats.totalArticles}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                المقالات المنشورة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {systemStats.publishedArticles}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                في الانتظار
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {systemStats.pendingArticles}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* إحصائيات المستخدمين */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                الكتاب
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {systemStats.totalWriters}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                الأدمن
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {systemStats.totalAdmins}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                السوبر أدمن
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {systemStats.totalSuperAdmins}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs للمقالات والمستخدمين والكاتيجوريز */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 flex-row-reverse">
            <TabsTrigger
              value="articles"
              className="arabic-text flex-row-reverse"
            >
              المقالات ({articles.length})
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              className="arabic-text flex-row-reverse"
            >
              الكاتيجوريز ({categories.length})
            </TabsTrigger>
            <TabsTrigger value="users" className="arabic-text flex-row-reverse">
              المستخدمين ({users.length})
            </TabsTrigger>
          </TabsList>

          {/* تب المقالات */}
          <TabsContent value="articles">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center flex-row-reverse">
                  <div>
                    <CardTitle className="arabic-heading text-right">
                      المقالات
                    </CardTitle>
                    <CardDescription className="arabic-text">
                      جميع المقالات في النظام
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() =>
                      (window.location.href = "/dashboard/super-admin/create")
                    }
                    className="bg-green-600 hover:bg-green-700 cursor-pointer"
                  >
                    إضافة مقال جديد
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {articles.length > 0 ? (
                    articles.map((article) => (
                      <div
                        key={article.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white arabic-heading mb-2">
                            {article.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span>✍️ {article.authorName}</span>
                            <span>
                              📅{" "}
                              {new Date(article.publishedAt).toLocaleDateString(
                                "ar-EG"
                              )}
                            </span>
                            <span>📂 {article.categoryName || "بدون قسم"}</span>
                            {article.isTrending && (
                              <span className="text-orange-600">🔥 تريند</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Link
                            href={`/dashboard/super-admin/article/${article.id}`}
                          >
                            <Button variant="outline" size="sm">
                              مراجعة
                            </Button>
                          </Link>
                          <Link
                            href={`/dashboard/super-admin/article/${article.id}/edit`}
                          >
                            <Button variant="outline" size="sm">
                              تعديل
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400 arabic-text">
                      لا توجد مقالات
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {articlesTotal > articlesPageSize && (
                  <div className="mt-6 flex justify-center">
                    <Pagination
                      currentPage={articlesPageIndex}
                      totalPages={Math.ceil(articlesTotal / articlesPageSize)}
                      onPageChange={handleArticlesPageChange}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* تب الكاتيجوريز */}
          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center flex-row-reverse">
                  <div>
                    <CardTitle className="arabic-heading text-right">
                      الكاتيجوريز
                    </CardTitle>
                    <CardDescription className="arabic-text">
                      جميع الكاتيجوريز والتصنيفات الفرعية في النظام
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setShowCreateCategoryModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  >
                    إضافة كاتيجوري جديد
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.length > 0 ? (
                    categories.map((category: any) => {
                      const subCategories = categories.filter(
                        (cat: any) => cat.parentId === category.id
                      );

                      return (
                        <div
                          key={category.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-white arabic-heading mb-2">
                              {category.name}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <span>🏷️ {category.slug}</span>
                              <span>
                                📝 {category.description || "لا يوجد وصف"}
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  category.parentId === null
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {category.parentId === null
                                  ? "كاتيجوري رئيسي"
                                  : "سابكاتيجوري"}
                              </span>
                            </div>

                            {subCategories.length > 0 && (
                              <div className="mt-3 pl-4 border-r-2 border-gray-200 dark:border-gray-600">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 arabic-text">
                                  التصنيفات الفرعية:
                                </h4>
                                <div className="space-y-1">
                                  {subCategories.map((subCategory: any) => (
                                    <div
                                      key={subCategory.id}
                                      className="text-sm text-gray-600 dark:text-gray-400 arabic-text"
                                    >
                                      • {subCategory.name} ({subCategory.slug})
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Link
                              href={`/dashboard/super-admin/category/${category.id}/edit`}
                            >
                              <Button variant="outline" size="sm">
                                تعديل
                              </Button>
                            </Link>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                handleDeleteCategoryClick(category)
                              }
                            >
                              حذف
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400 arabic-text">
                      لا توجد كاتيجوريز
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* تب المستخدمين */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center flex-row-reverse">
                  <div>
                    <CardTitle className="arabic-heading text-right">
                      المستخدمين
                    </CardTitle>
                    <CardDescription className="arabic-text float-right">
                      إدارة جميع المستخدمين في النظام
                    </CardDescription>
                  </div>
                  <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <Link href="/dashboard/super-admin/users/create">
                      إضافة مستخدم جديد
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.length > 0 ? (
                    users.map((user: any) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white arabic-heading mb-2">
                            {user.displayName || user.fullName || "غير محدد"}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400  flex-start">
                            <span>👤 {user.userName || "غير محدد"}</span>
                            <span>📧 {user.email || "غير محدد"}</span>
                            <span>📞 {user.phoneNumber || "غير محدد"}</span>
                            {user.nationalId && (
                              <span>🆔 {user.nationalId}</span>
                            )}
                          </div>
                          {user.categories && user.categories.length > 0 && (
                            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                              <span>📂 التصنيفات:</span>
                              {user.categories.map((cat: any, idx: number) => (
                                <span
                                  key={cat.id}
                                  className="px-2 py-1 bg-gray-100 rounded"
                                >
                                  {cat.name}
                                  {idx < user.categories.length - 1 && ","}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(
                              user.roles
                            )}`}
                          >
                            {getRoleText(user.roles)}
                          </span>
                          <Button
                            className="me-2 cursor-pointer"
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <Link
                              href={`/dashboard/super-admin/users/${user.id}`}
                            >
                              عرض
                            </Link>
                          </Button>
                          <Button
                            className="me-2 cursor-pointer"
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <Link
                              href={`/dashboard/super-admin/users/edit/${user.id}`}
                            >
                              تعديل
                            </Link>
                          </Button>
                          {!user.roles?.includes("SuperAdmin") && (
                            <Button
                              className="me-2 cursor-pointer"
                              variant="secondary"
                              size="sm"
                              onClick={() => handleUpdateRoleClick(user)}
                            >
                              تحديث الدور
                            </Button>
                          )}
                          <Button
                            className="cursor-pointer"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteClick(user)}
                          >
                            حذف
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400 arabic-text">
                      لا توجد مستخدمين
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="arabic-text">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 space-x-reverse text-red-600">
              <span>⚠️</span>
              <span>{userToDelete ? "تأكيد الحذف" : "غير مسموح"}</span>
            </DialogTitle>
            <DialogDescription className="arabic-text text-lg">
              {userToDelete
                ? "هل أنت متأكد من حذف المستخدم التالي؟"
                : "لا يمكن حذف السوبر أدمن"}
            </DialogDescription>
          </DialogHeader>

          {userToDelete && (
            <div className="bg-gray-50 p-4 rounded-lg arabic-text">
              <h3 className="font-medium text-gray-900 mb-2">
                {userToDelete.displayName ||
                  userToDelete.fullName ||
                  "غير محدد"}
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>👤 {userToDelete.userName || "غير محدد"}</p>
                <p>📧 {userToDelete.email || "غير محدد"}</p>
                <p>📞 {userToDelete.phoneNumber || "غير محدد"}</p>
                {userToDelete.nationalId && <p>🆔 {userToDelete.nationalId}</p>}
                <p>🎭 {getRoleText(userToDelete.roles)}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {deleteSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg arabic-text">
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="text-green-600">✅</span>
                <span>{deleteSuccess}</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {deleteError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg arabic-text">
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="text-red-600">❌</span>
                <span>{deleteError}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4 mt-4">
            {userToDelete ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancelDelete}
                  disabled={deleteLoading}
                >
                  إلغاء
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteUser}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>جاري الحذف...</span>
                    </div>
                  ) : (
                    "حذف المستخدم"
                  )}
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                إغلاق
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Update Role Modal */}
      <Dialog open={showRoleModal} onOpenChange={setShowRoleModal}>
        <DialogContent className="arabic-text">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 space-x-reverse text-blue-600">
              <span>🎭</span>
              <span>
                {userToUpdateRole ? "تحديث دور المستخدم" : "غير مسموح"}
              </span>
            </DialogTitle>
            <DialogDescription className="arabic-text text-lg">
              {userToUpdateRole
                ? "اختر الدور الجديد للمستخدم"
                : "لا يمكن تحديث دور السوبر أدمن"}
            </DialogDescription>
          </DialogHeader>

          {userToUpdateRole && (
            <div className="bg-gray-50 p-4 rounded-lg arabic-text">
              <h3 className="font-medium text-gray-900 mb-2">
                {userToUpdateRole.displayName ||
                  userToUpdateRole.fullName ||
                  "غير محدد"}
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>👤 {userToUpdateRole.userName || "غير محدد"}</p>
                <p>📧 {userToUpdateRole.email || "غير محدد"}</p>
                <p>🎭 الدور الحالي: {getRoleText(userToUpdateRole.roles)}</p>
              </div>
            </div>
          )}

          {userToUpdateRole && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 arabic-text">
                  اختر الدور الجديد:
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg arabic-text focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- اختر الدور --</option>
                  <option value="User">كاتب (User)</option>
                  <option value="Admin">أدمن (Admin)</option>
                </select>
                <p className="text-xs text-gray-500 arabic-text">
                  يمكنك اختيار دور واحد فقط: إما كاتب (User) أو أدمن (Admin)
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4 mt-4">
            {userToUpdateRole ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowRoleModal(false)}
                  disabled={roleUpdateLoading}
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleUpdateUserRole}
                  disabled={roleUpdateLoading}
                >
                  {roleUpdateLoading ? (
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>جاري التحديث...</span>
                    </div>
                  ) : (
                    "تحديث الدور"
                  )}
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setShowRoleModal(false)}>
                إغلاق
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Role Update Result Modal */}
      <Dialog open={showRoleResultModal} onOpenChange={setShowRoleResultModal}>
        <DialogContent className="arabic-text">
          <DialogHeader>
            <DialogTitle
              className={`flex items-center space-x-2 space-x-reverse ${
                roleResultType === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              <span>{roleResultType === "success" ? "✅" : "❌"}</span>
              <span>
                {roleResultType === "success" ? "تم بنجاح!" : "حدث خطأ!"}
              </span>
            </DialogTitle>
            <DialogDescription className="arabic-text text-lg">
              {roleResultMessage}
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end space-x-2 space-x-reverse mt-4">
            <Button
              variant="outline"
              onClick={() => setShowRoleResultModal(false)}
            >
              إغلاق
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Category Modal */}
      <Dialog
        open={showCreateCategoryModal}
        onOpenChange={setShowCreateCategoryModal}
      >
        <DialogContent className="arabic-text max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 space-x-reverse text-blue-600">
              <span>➕</span>
              <span>إضافة كاتيجوري جديد</span>
            </DialogTitle>
            <DialogDescription className="arabic-text">
              أدخل بيانات الكاتيجوري الجديد
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* الاسم */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 arabic-text">
                الاسم *
              </label>
              <input
                type="text"
                value={newCategoryData.Name}
                onChange={(e) =>
                  setNewCategoryData({
                    ...newCategoryData,
                    Name: e.target.value,
                  })
                }
                className="w-full p-2 border border-gray-300 rounded-lg arabic-text"
                placeholder="أدخل اسم الكاتيجوري"
              />
            </div>

            {/* الـ Slug */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 arabic-text">
                الـ Slug *
              </label>
              <input
                type="text"
                value={newCategoryData.Slug}
                onChange={(e) =>
                  setNewCategoryData({
                    ...newCategoryData,
                    Slug: e.target.value,
                  })
                }
                className="w-full p-2 border border-gray-300 rounded-lg arabic-text"
                placeholder="أدخل الـ slug"
              />
            </div>

            {/* الوصف */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 arabic-text">
                الوصف
              </label>
              <textarea
                value={newCategoryData.Description}
                onChange={(e) =>
                  setNewCategoryData({
                    ...newCategoryData,
                    Description: e.target.value,
                  })
                }
                className="w-full p-2 border border-gray-300 rounded-lg arabic-text"
                placeholder="أدخل وصف الكاتيجوري"
                rows={3}
              />
            </div>

            {/* نوع الكاتيجوري */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 arabic-text">
                نوع الكاتيجوري
              </label>
              <select
                value={newCategoryData.ParentId || ""}
                onChange={(e) =>
                  setNewCategoryData({
                    ...newCategoryData,
                    ParentId:
                      e.target.value === "" ? null : parseInt(e.target.value),
                  })
                }
                className="w-full p-2 border border-gray-300 rounded-lg arabic-text"
              >
                <option value="">كاتيجوري رئيسي</option>
                {categories
                  .filter((cat: any) => cat.parentId === null)
                  .map((category: any) => (
                    <option key={category.id} value={category.id}>
                      سابكاتيجوري تحت: {category.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* رسائل النجاح والخطأ - تم إزالتها */}
          </div>

          <div className="flex justify-end gap-4 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowCreateCategoryModal(false)}
              disabled={createCategoryLoading}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleCreateCategory}
              disabled={createCategoryLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createCategoryLoading ? (
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>جاري الإنشاء...</span>
                </div>
              ) : (
                "إنشاء الكاتيجوري"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Result Modal */}
      <Dialog
        open={showCategoryResultModal}
        onOpenChange={setShowCategoryResultModal}
      >
        <DialogContent className="arabic-text">
          <DialogHeader>
            <DialogTitle
              className={`flex items-center space-x-2 space-x-reverse ${
                categoryResultType === "success"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              <span>{categoryResultType === "success" ? "✅" : "❌"}</span>
              <span>
                {categoryResultType === "success" ? "تم بنجاح!" : "حدث خطأ!"}
              </span>
            </DialogTitle>
            <DialogDescription className="arabic-text text-lg">
              {categoryResultMessage}
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end space-x-2 space-x-reverse mt-4">
            <Button
              variant="outline"
              onClick={() => setShowCategoryResultModal(false)}
            >
              إغلاق
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation Modal */}
      <Dialog
        open={showDeleteCategoryModal}
        onOpenChange={setShowDeleteCategoryModal}
      >
        <DialogContent className="arabic-text">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 space-x-reverse text-red-600">
              <span>⚠️</span>
              <span>تأكيد الحذف</span>
            </DialogTitle>
            <DialogDescription className="arabic-text text-lg">
              هل أنت متأكد من حذف الكاتيجوري "{categoryToDelete?.name}"؟
              <br />
              {(() => {
                const subcategories = categories.filter(
                  (cat: any) => cat.parentId === categoryToDelete?.id
                ) as any[];
                return subcategories.length > 0 ? (
                  <>
                    <span className="text-orange-600 font-medium">
                      سيتم حذف {subcategories.length} سابكاتيجوري معه أيضاً!
                    </span>
                    <br />
                  </>
                ) : null;
              })()}
              <span className="text-red-600 font-medium">
                هذا الإجراء لا يمكن التراجع عنه!
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteCategoryModal(false)}
              disabled={deleteCategoryLoading}
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCategory}
              disabled={deleteCategoryLoading}
            >
              {deleteCategoryLoading ? (
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>جاري الحذف...</span>
                </div>
              ) : (
                "حذف الكاتيجوري"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Result Modal */}
      <Dialog
        open={showDeleteResultModal}
        onOpenChange={setShowDeleteResultModal}
      >
        <DialogContent className="arabic-text">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 space-x-reverse text-blue-600">
              <span>{deleteResultType === "success" ? "✅" : "❌"}</span>
              <span>
                {deleteResultType === "success" ? "تم بنجاح!" : "حدث خطأ!"}
              </span>
            </DialogTitle>
            <DialogDescription className="arabic-text text-lg">
              {deleteResultMessage}
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end">
            <Button
              onClick={() => setShowDeleteResultModal(false)}
              className={
                deleteResultType === "success"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              إغلاق
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
