import { notFound } from "next/navigation";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface NewsDetailPageProps {
  params: {
    slug: string;
  };
}

export default function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { slug } = params;

  // بيانات تجريبية - سيتم استبدالها بالـ API
  const mockArticle = {
    id: "1",
    title: "تطورات جديدة في الأزمة السياسية في المنطقة العربية",
    slug: slug,
    summary:
      "شهدت المنطقة العربية تطورات مهمة في الأزمة السياسية الجارية، مع إعلان عدة دول عن مواقف جديدة تجاه القضايا الإقليمية المطروحة.",
    content: `
      <h2>تطورات مهمة في المنطقة</h2>
      <p>شهدت المنطقة العربية تطورات مهمة في الأزمة السياسية الجارية، مع إعلان عدة دول عن مواقف جديدة تجاه القضايا الإقليمية المطروحة.</p>
      
      <h3>المواقف الجديدة</h3>
      <p>أعلنت عدة دول عربية عن مواقف جديدة تجاه القضايا الإقليمية المطروحة، مما يفتح آفاقاً جديدة للحوار والتفاهم.</p>
      
      <table border="1" style="width: 100%; border-collapse: collapse;">
        <tr>
          <th>الدولة</th>
          <th>الموقف</th>
          <th>التاريخ</th>
        </tr>
        <tr>
          <td>السعودية</td>
          <td>دعم الحوار</td>
          <td>2024-01-15</td>
        </tr>
        <tr>
          <td>الإمارات</td>
          <td>دعم الاستقرار</td>
          <td>2024-01-14</td>
        </tr>
      </table>
      
      <h3>التوقعات المستقبلية</h3>
      <p>يتوقع الخبراء أن تؤدي هذه التطورات إلى تحسين الوضع الإقليمي وتعزيز التعاون بين الدول العربية.</p>
    `,
    featuredImage:
      "https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=1200&h=600&fit=crop",
    category: "سياسة",
    publishDate: "2024-01-15",
    readTime: "5 دقائق",
    author: {
      name: "أحمد محمد",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    },
  };

  if (!mockArticle) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* الصورة الرئيسية */}
          <div className="relative h-96 w-full">
            <Image
              src={mockArticle.featuredImage}
              alt={mockArticle.title}
              fill
              className="object-cover"
            />
            <div className="absolute top-6 right-6">
              <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                {mockArticle.category}
              </span>
            </div>
          </div>

          {/* المحتوى */}
          <div className="p-8">
            {/* العنوان */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 arabic-heading">
              {mockArticle.title}
            </h1>

            {/* معلومات المقالة */}
            <div className="flex items-center justify-between mb-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Image
                    src={mockArticle.author.avatar}
                    alt={mockArticle.author.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <span className="arabic-text">{mockArticle.author.name}</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <span>📅</span>
                  <span>{mockArticle.publishDate}</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <span>⏰</span>
                  <span>{mockArticle.readTime}</span>
                </div>
              </div>
            </div>

            {/* الملخص */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
              <p className="text-lg text-gray-700 dark:text-gray-300 arabic-text">
                {mockArticle.summary}
              </p>
            </div>

            {/* المحتوى */}
            <div
              className="prose prose-lg max-w-none arabic-text"
              dangerouslySetInnerHTML={{ __html: mockArticle.content }}
            />
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}



