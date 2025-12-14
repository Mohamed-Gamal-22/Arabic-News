import ArticleCard from "@/components/ArticleCard";
import { getCategoriesServer } from "@/lib/categories";
import { getArticles } from "@/lib/api";
import { notFound } from "next/navigation";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  const categories = await getCategoriesServer();
  const category = categories.find(
    (cat) => cat.slug.toLowerCase() === slug.toLowerCase()
  );

  if (!category) {
    notFound();
  }

  const articlesResponse = await getArticles(1, 100);
  const categoryArticles =
    articlesResponse.data?.filter(
      (article) =>
        article.categoryName?.toLowerCase() === category.name.toLowerCase()
    ) || [];

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
          <p className="text-gray-600 dark:text-gray-300 mt-3 arabic-text">
            استكشف أحدث المقالات ضمن هذا القسم.
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
            <p className="text-xl text-gray-700 dark:text-gray-300 arabic-text">
              لا توجد مقالات لهذا القسم حالياً.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}





