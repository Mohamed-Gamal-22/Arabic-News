"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ArticleCard from "@/components/ArticleCard";
import { getCategories } from "@/lib/api";
import { getArticles, ApiArticle } from "@/lib/api";
import { Pagination } from "@/components/ui/pagination";

// دالة لتطبيع الـ slug (إزالة المسافات والأحرف الخاصة)
function normalizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export default function CategoryPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const normalizedSlug = normalizeSlug(slug || "");

  const [categories, setCategories] = useState<any[]>([]);
  const [category, setCategory] = useState<any>(null);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [categoryArticles, setCategoryArticles] = useState<ApiArticle[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 12;

  // جلب التصنيفات
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await getCategories();
        setCategories(cats || []);

        // البحث عن التصنيف في جميع التصنيفات (الرئيسية والفرعية)
        // التصنيفات تأتي كقائمة مسطحة، التصنيفات الفرعية لها parentId
        let foundCategory = cats?.find((cat: any) => {
          const catSlug = cat.slug ? normalizeSlug(cat.slug) : "";
          return catSlug === normalizedSlug;
        });

        // إذا لم نجد التصنيف، نبحث بشكل أكثر مرونة
        if (!foundCategory) {
          // البحث بدون تطبيع slug (في حالة وجود مشاكل في التطبيع)
          foundCategory = cats?.find((cat: any) => {
            if (!cat.slug) return false;
            const catSlug = cat.slug.toLowerCase().trim();
            const searchSlug = (slug || "").toLowerCase().trim();
            return (
              catSlug === searchSlug ||
              catSlug === decodeURIComponent(searchSlug) ||
              decodeURIComponent(catSlug) === searchSlug
            );
          });
        }

        setCategory(foundCategory);

        // إذا كان التصنيف رئيسي (parentId === null أو غير موجود)، نحصل على السابكاتيجوري
        if (foundCategory) {
          setCategoryName(foundCategory.name);

          // التحقق من أن التصنيف رئيسي (ليس له parentId أو parentId === null)
          const isMainCategory =
            !foundCategory.parentId || foundCategory.parentId === null;

          if (isMainCategory) {
            // الحصول على جميع السابكاتيجوري التابعة لهذا التصنيف الرئيسي
            const categoryId =
              typeof foundCategory.id === "string"
                ? parseInt(foundCategory.id, 10)
                : foundCategory.id;

            const subCats = (cats || []).filter((cat: any) => {
              if (!cat.parentId) return false;
              const catParentId =
                typeof cat.parentId === "string"
                  ? parseInt(cat.parentId, 10)
                  : cat.parentId;
              return catParentId === categoryId;
            });

            setSubCategories(subCats);
          } else {
            // إذا كان التصنيف فرعي، لا يوجد سابكاتيجوري
            setSubCategories([]);
          }
        } else {
          setCategoryName(decodeURIComponent(slug || ""));
          setSubCategories([]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategoryName(decodeURIComponent(slug || ""));
        setSubCategories([]);
        setLoading(false);
      }
    };

    fetchCategories();
  }, [slug, normalizedSlug]);

  // جلب المقالات عند تغيير الصفحة أو التصنيف
  useEffect(() => {
    const fetchArticles = async () => {
      if (!category) {
        setCategoryArticles([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // دالة لتطبيع اسم التصنيف للمقارنة - محسّنة
        const normalizeCategoryName = (name: string): string => {
          if (!name) return "";
          return name
            .toLowerCase()
            .trim()
            .replace(/\s+/g, " ") // استبدال المسافات المتعددة بمسافة واحدة
            .replace(/[^\w\s\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]+/g, "") // إزالة الأحرف الخاصة مع دعم المزيد من الأحرف العربية
            .replace(/\u0640/g, "") // إزالة التطويل (tatweel)
            .trim();
        };

        // دالة للمقارنة المرنة بين أسماء التصنيفات
        // useExactMatch: إذا كان true، نستخدم مقارنة دقيقة فقط (للسابكاتيجوري)
        const categoryNamesMatch = (
          name1: string,
          name2: string,
          useExactMatch: boolean = false
        ): boolean => {
          if (!name1 || !name2) return false;

          const norm1 = normalizeCategoryName(name1);
          const norm2 = normalizeCategoryName(name2);

          // مقارنة مباشرة بعد التطبيع
          if (norm1 === norm2) return true;

          // إزالة "ال" التعريف من البداية
          const removeAl = (str: string) => {
            // إزالة "ال" من البداية فقط
            return str.replace(/^ال\s*/, "").trim();
          };

          const norm1NoAl = removeAl(norm1);
          const norm2NoAl = removeAl(norm2);

          // مقارنة بعد إزالة "ال"
          if (norm1NoAl === norm2NoAl && norm1NoAl.length > 0) return true;

          // مقارنة مع الأسماء الأصلية (مع وبدون "ال")
          if (norm1NoAl === norm2 || norm2NoAl === norm1) return true;

          // حتى للسابكاتيجوري، نسمح بمقارنة أكثر مرونة إذا كانت الأسماء متشابهة جداً
          // لكن نتجنب المقارنة الجزئية التي قد تجلب مقالات من سابكاتيجوري أخرى
          if (useExactMatch) {
            // للسابكاتيجوري، نسمح بالمقارنة الدقيقة (مع وبدون "ال")
            // لكن نسمح أيضاً بمقارنة إذا كان الاسم متطابق تماماً بعد إزالة المسافات والأحرف الخاصة
            return false;
          }

          // مقارنة جزئية (إذا كان أحد الأسماء يحتوي على الآخر) - فقط للكاتيجوري الرئيسي
          // نستخدم المقارنة الجزئية فقط إذا كان الاسم المطلوب أطول من 3 أحرف
          if (norm1.length >= 3 && norm2.length >= 3) {
            if (norm1.includes(norm2) || norm2.includes(norm1)) return true;
            if (norm1NoAl.includes(norm2NoAl) || norm2NoAl.includes(norm1NoAl))
              return true;
          }

          return false;
        };

        // التحقق من أن التصنيف رئيسي (ليس له parentId أو parentId === null)
        const isMainCategory =
          !(category as any).parentId || (category as any).parentId === null;

        // إنشاء قائمة بأسماء التصنيفات المطلوبة
        const categoryNamesToMatch: string[] = [category.name];

        // فقط إذا كان التصنيف رئيسي، نضيف أسماء السابكاتيجوري
        if (isMainCategory && subCategories.length > 0) {
          subCategories.forEach((subCat: any) => {
            if (subCat.name) {
              categoryNamesToMatch.push(subCat.name);
            }
          });
        }

        // Logging للتحقق من البيانات (يمكن إزالتها لاحقاً)
        // console.log("=== Category Filtering Debug ===");
        // console.log("Category name:", category.name);
        // console.log("Category ID:", category.id);
        // console.log("Is main category:", isMainCategory);
        // console.log("Sub categories:", subCategories.map((c: any) => c.name));
        // console.log("Category names to match:", categoryNamesToMatch);

        // جلب جميع المقالات المنشورة
        let allFetchedArticles: ApiArticle[] = [];
        let pageToFetch = 1;
        let hasMorePages = true;
        let totalArticlesCount = 0;
        let totalPagesFromAPI = 1;

        // جمع جميع أسماء التصنيفات الفريدة من جميع المقالات للتحقق
        const allUniqueCategoryNames = new Set<string>();

        // جلب المقالات حتى نحصل على جميع المقالات أو نفاد المقالات
        while (hasMorePages && pageToFetch <= 50) {
          // زيادة الحد الأقصى إلى 50 صفحة
          const articlesResponse = await getArticles(
            pageToFetch,
            100, // جلب 100 مقالة في كل مرة
            false,
            undefined,
            false
          );

          if (articlesResponse && articlesResponse.data) {
            const pageArticles = articlesResponse.data || [];

            // حساب عدد الصفحات الإجمالي من API
            if (pageToFetch === 1 && articlesResponse.totalCount) {
              // استخدام pageSize الفعلي من API بدلاً من المطلوب
              const actualPageSize =
                articlesResponse.pageSize || pageArticles.length || 100;
              totalPagesFromAPI = Math.ceil(
                articlesResponse.totalCount / actualPageSize
              );
              // console.log(
              //   `Total articles in API: ${articlesResponse.totalCount}, Actual pageSize: ${actualPageSize}, Total pages: ${totalPagesFromAPI}`
              // );
            }

            // جمع جميع أسماء التصنيفات الفريدة من المقالات للتحقق
            pageArticles.forEach((article) => {
              if (article.categoryName) {
                allUniqueCategoryNames.add(article.categoryName);
              }
            });

            if (pageToFetch === 1) {
              console.log(
                "First page - Unique category names:",
                Array.from(allUniqueCategoryNames)
              );
            }

            // تصفية المقالات حسب التصنيف
            const filteredArticles = pageArticles.filter((article) => {
              if (!article.categoryName) return false;

              // التحقق من أن المقال ينتمي لأي من التصنيفات المطلوبة
              const matches = categoryNamesToMatch.some((catName) => {
                // للسابكاتيجوري، نستخدم مقارنة دقيقة لكن مرنة مع "ال"
                // للكاتيجوري الرئيسي، نستخدم مقارنة مرنة كاملة
                const useExactMatch = !isMainCategory;

                // تطبيع الأسماء
                const normCatName = normalizeCategoryName(catName);
                const normArticleCat = normalizeCategoryName(
                  article.categoryName
                );

                // مقارنة مباشرة
                if (normCatName === normArticleCat) return true;

                // إزالة "ال" والمقارنة
                const catNameNoAl = normCatName.replace(/^ال\s*/, "").trim();
                const articleCatNoAl = normArticleCat
                  .replace(/^ال\s*/, "")
                  .trim();

                if (catNameNoAl === articleCatNoAl && catNameNoAl.length > 0)
                  return true;

                // مقارنة مع الأسماء الأصلية (مع وبدون "ال")
                if (
                  catNameNoAl === normArticleCat ||
                  articleCatNoAl === normCatName
                )
                  return true;

                // إذا كان كاتيجوري رئيسي، نجرب مقارنة جزئية
                if (
                  !useExactMatch &&
                  catNameNoAl.length >= 3 &&
                  articleCatNoAl.length >= 3
                ) {
                  if (
                    catNameNoAl.includes(articleCatNoAl) ||
                    articleCatNoAl.includes(catNameNoAl)
                  ) {
                    return true;
                  }
                }

                // للسابكاتيجوري، نسمح بمقارنة أكثر مرونة إذا كانت الأسماء متشابهة جداً
                // لكن نتجنب المقارنة الجزئية التي قد تجلب مقالات من سابكاتيجوري أخرى
                if (useExactMatch) {
                  // محاولة مقارنة مع إزالة المسافات والأحرف الخاصة فقط
                  const catNameClean = catNameNoAl.replace(/\s+/g, "");
                  const articleCatClean = articleCatNoAl.replace(/\s+/g, "");
                  if (
                    catNameClean === articleCatClean &&
                    catNameClean.length > 0
                  ) {
                    return true;
                  }
                }

                return false;
              });

              // Logging للتحقق من المقالات المفلترة (يمكن إزالتها لاحقاً)
              // if (pageToFetch === 1 && matches) {
              //   console.log(
              //     `Article matched: "${article.title}" - Category: "${article.categoryName}"`
              //   );
              // }

              return matches;
            });

            allFetchedArticles = [...allFetchedArticles, ...filteredArticles];

            if (pageToFetch === 1) {
              totalArticlesCount = allFetchedArticles.length; // تقدير العدد الإجمالي
            }

            // التحقق من وجود صفحات أخرى
            // استخدام pageSize الفعلي من API
            const actualPageSize =
              articlesResponse.pageSize || pageArticles.length || 100;
            if (
              pageArticles.length < actualPageSize ||
              pageToFetch >= totalPagesFromAPI
            ) {
              hasMorePages = false;
            } else {
              pageToFetch++;
            }
          } else {
            hasMorePages = false;
          }
        }

        // طباعة جميع أسماء التصنيفات الفريدة بعد جلب جميع المقالات (يمكن إزالتها لاحقاً)
        // console.log(
        //   "All unique category names after fetching all pages:",
        //   Array.from(allUniqueCategoryNames)
        // );
        // console.log(`Total articles fetched: ${allFetchedArticles.length}`);
        // console.log(`Total pages fetched: ${pageToFetch}`);

        // البحث عن مقالات قد تكون متعلقة بـ "Sports" لكن بأسماء مختلفة
        const sportsRelatedCategories = Array.from(
          allUniqueCategoryNames
        ).filter((catName) => {
          const normCat = normalizeCategoryName(catName);
          const normSports = normalizeCategoryName("Sports");
          const normSportsNoAl = normSports.replace(/^ال\s*/, "").trim();
          const normCatNoAl = normCat.replace(/^ال\s*/, "").trim();

          return (
            normCat.includes("sport") ||
            normCatNoAl.includes("sport") ||
            normCat.includes("رياض") ||
            normCatNoAl.includes("رياض") ||
            normCat === normSports ||
            normCatNoAl === normSportsNoAl
          );
        });

        // البحث عن تصنيفات مشابهة (يمكن تفعيلها للـ debugging)
        // if (sportsRelatedCategories.length > 0) {
        //   console.log("⚠️ Found potential Sports-related categories:", sportsRelatedCategories);
        // } else {
        //   if (category.name === "Sports" && allFetchedArticles.length === 0) {
        //     console.log("⚠️ No articles found for 'Sports' category");
        //     console.log("⚠️ Available categories in articles:", Array.from(allUniqueCategoryNames));
        //   }
        // }

        // حساب عدد الصفحات
        const calculatedTotalPages = Math.ceil(
          allFetchedArticles.length / pageSize
        );
        setTotalPages(calculatedTotalPages > 0 ? calculatedTotalPages : 1);
        setTotalCount(allFetchedArticles.length);

        // تحديد المقالات للصفحة الحالية
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const articlesToShow = allFetchedArticles.slice(startIndex, endIndex);

        setCategoryArticles(articlesToShow);
      } catch (error) {
        console.error("Error fetching articles:", error);
        setCategoryArticles([]);
        setError("فشل في جلب المقالات. يرجى المحاولة مرة أخرى.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [category, subCategories, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className="container mx-auto px-4 py-10">
        <div className="max-w-6xl mx-auto mb-8 text-center">
          <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold mb-2">
            {category ? "جميع المقالات" : "البحث عن التصنيف"}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white arabic-heading">
            {categoryName}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-3 arabic-text">
            {!category
              ? "التصنيف المطلوب غير موجود في الموقع."
              : loading
              ? "جاري التحميل..."
              : categoryArticles.length > 0
              ? "استكشف أحدث المقالات ضمن هذا القسم."
              : "لا توجد مقالات متاحة في هذا القسم حالياً."}
          </p>
        </div>

        {error ? (
          <div className="max-w-3xl mx-auto bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-3xl shadow-lg p-10 text-center">
            <div className="space-y-4">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-red-900 dark:text-red-200 arabic-heading">
                خطأ في التحميل
              </h2>
              <p className="text-lg text-red-700 dark:text-red-300 arabic-text">
                {error}
              </p>
              <button
                onClick={() => {
                  setError(null);
                  window.location.reload();
                }}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors arabic-text"
              >
                إعادة المحاولة
              </button>
            </div>
          </div>
        ) : loading ? (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(12)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse"
                >
                  <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : categoryArticles.length > 0 ? (
          <>
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {categoryArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="max-w-6xl mx-auto mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  className="justify-center"
                />
                <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400 arabic-text">
                  صفحة {currentPage} من {totalPages}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-10 text-center">
            <div className="space-y-4">
              <div className="text-6xl mb-4">📰</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white arabic-heading">
                {category ? "لا توجد مقالات" : "التصنيف غير موجود"}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 arabic-text">
                {category
                  ? `عذراً، لا توجد مقالات متاحة في قسم ${category.name} حالياً.`
                  : `عذراً، التصنيف "${categoryName}" غير موجود في الموقع.`}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 arabic-text">
                {category
                  ? "تحقق مرة أخرى لاحقاً للاطلاع على المقالات الجديدة."
                  : "يرجى التحقق من رابط التصنيف أو تصفح التصنيفات المتاحة من القائمة الرئيسية."}
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
