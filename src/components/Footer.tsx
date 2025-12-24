"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

type FooterCategory = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
};

type FooterProps = {
  categories?: FooterCategory[];
};

export default function Footer({ categories = [] }: FooterProps) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  const topCategories = useMemo(() => {
    if (!Array.isArray(categories)) return [];
    return categories.filter((cat) => cat.parentId === null);
  }, [categories]);

  if (!isHomePage) {
    return null;
  }

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* معلومات الموقع */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <span className="text-xl font-bold arabic-heading">
                موقع فوكس نيوز للأخبار العربية والعالم
              </span>
            </div>
            <p className="text-gray-400 arabic-text mb-4">
              موقع إخباري شامل يقدم آخر الأخبار العربية والعالمية بأسلوب مهني
              وموضوعي. نلتزم بتقديم المعلومات الدقيقة والتحليلات المتعمقة لجميع
              القراء العرب.
            </p>
          </div>

          {/* أقسام الموقع */}
          <div>
            <h3 className="text-lg font-semibold mb-4 arabic-heading">
              الأقسام
            </h3>
            <ul className="space-y-2">
              {topCategories.length > 0 ? (
                topCategories.slice(0, 8).map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/category/${category.slug}`}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-gray-500 arabic-text">
                  لا توجد أقسام متاحة حالياً
                </li>
              )}
            </ul>
          </div>

          {/* معلومات التواصل */}
          <div>
            <h3 className="text-lg font-semibold mb-4 arabic-heading">
              تواصل معنا
            </h3>
            <ul className="space-y-2 text-gray-400">
              <li>الهاتف: 01010076810</li>
              <li>الهاتف: 01144863813</li>
              <li>العنوان: القاهرة جمهورية مصر العربية</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 موقع الأخبار العربية. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}



