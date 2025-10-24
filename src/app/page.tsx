import FeaturedNewsCard from "@/components/FeaturedNewsCard";
import TrendingNewsSlider from "@/components/TrendingNewsSlider";
import NewsCard from "@/components/NewsCard";
import { sampleNews, featuredNews } from "@/data/sampleNews";

export default function Home() {
  // الحصول على أول 4 أخبار للسلايدر
  const trendingNews = sampleNews.slice(0, 4);
  
  // الحصول على باقي الأخبار للعرض في الشبكة
  const regularNews = sampleNews.slice(4);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* الهيرو سيكشن مع الأخبار المميزة */}
      <section className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 text-center arabic-heading">
            مرحباً بكم في موقع الأخبار العربي
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 text-center arabic-text">
            نقدم لكم آخر الأخبار والتطورات من الوطن العربي والعالم
          </p>
        </div>

        {/* الأخبار المميزة */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 arabic-heading">
            الأخبار المميزة
          </h2>
          <FeaturedNewsCard
            id={featuredNews.id}
            title={featuredNews.title}
            summary={featuredNews.summary}
            imageUrl={featuredNews.imageUrl}
            category={featuredNews.category}
            publishDate={featuredNews.publishDate}
            readTime={featuredNews.readTime}
          />
        </div>

        {/* سلايدر الأخبار الرائجة */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 arabic-heading">
            الأخبار الرائجة
          </h2>
          <TrendingNewsSlider articles={trendingNews} />
        </div>

        {/* شبكة الأخبار العادية */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 arabic-heading">
            آخر الأخبار
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularNews.map((news) => (
              <NewsCard
                key={news.id}
                id={news.id}
                title={news.title}
                summary={news.summary}
                imageUrl={news.imageUrl}
                category={news.category}
                publishDate={news.publishDate}
                readTime={news.readTime}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
