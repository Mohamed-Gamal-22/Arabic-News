import ArticleCard from "@/components/ArticleCard";
import { getCategoriesServer } from "@/lib/categories";
import { getArticles } from "@/lib/api";
import { notFound } from "next/navigation";

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = params;

  const categories = await getCategoriesServer();
  const category = categories.find(
    (cat) => cat.slug.toLowerCase() === slug.toLowerCase()
  );

  if (!category) {
    notFound();
  }

  // جلب جميع المقالات بشكل متكرر
  let allArticles: any[] = [];
  let page = 1;
  const pageSize = 100;
  let hasMore = true;

  // جلب جميع المقالات حتى ننتهي
  while (hasMore) {
    try {
      const articlesResponse = await getArticles(page, pageSize);
      if (articlesResponse.data && articlesResponse.data.length > 0) {
        allArticles = [...allArticles, ...articlesResponse.data];
        // إذا كان عدد المقالات أقل من pageSize، يعني انتهينا
        if (articlesResponse.data.length < pageSize) {
          hasMore = false;
        } else {
          page++;
        }
      } else {
        hasMore = false;
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
      hasMore = false;
    }
  }

  // تحديد التصنيفات المطلوبة (الرئيسي + الفرعية إذا كان رئيسي)
  const targetCategoryNames: string[] = [category.name];
  
  // إذا كان التصنيف رئيسي (parentId === null)، أضف جميع التصنيفات الفرعية
  if (category.parentId === null) {
    const subCategories = categories.filter(
      (cat) => cat.parentId === category.id
    );
    subCategories.forEach((subCat) => {
      targetCategoryNames.push(subCat.name);
    });
  }

  // فلترة المقالات حسب التصنيف (الرئيسي + الفرعية)
  const categoryArticles = allArticles.filter((article) => {
    if (!article.categoryName) return false;
    
    // مقارنة مرنة (تجاهل المسافات الزائدة والأحرف الخاصة)
    const articleCategory = article.categoryName.trim().toLowerCase();
    
    // التحقق من أن المقال ينتمي لأي من التصنيفات المطلوبة
    return targetCategoryNames.some(
      (targetCategory) => targetCategory.trim().toLowerCase() === articleCategory
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className="container mx-auto px-4 py-10">
        <div className="max-w-6xl mx-auto mb-8 text-center">
          <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold mb-2">
            جميع المقالات
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white arabic-heading">
            {category.name}
          </h1>
          {category.parentId === null && (
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-2 arabic-text">
              يشمل جميع التصنيفات الفرعية
            </p>
          )}
          <p className="text-gray-600 dark:text-gray-300 mt-3 arabic-text">
            {categoryArticles.length > 0
              ? `تم العثور على ${categoryArticles.length} مقال في هذا القسم${category.parentId === null ? " وتصنيفاته الفرعية" : ""}`
              : "استكشف أحدث المقالات ضمن هذا القسم."}
          </p>
        </div>

        {categoryArticles.length > 0 ? (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {categoryArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-10 text-center">
            <div className="text-6xl mb-4">📰</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 arabic-heading">
              لا توجد مقالات في هذا القسم
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 arabic-text">
              عذراً، لا توجد مقالات متاحة حالياً في تصنيف "{category.name}".
            </p>
          </div>
        )}
      </section>
    </div>
  );
}





