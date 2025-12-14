"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Category } from "@/lib/api";
import { useSession } from "next-auth/react";

interface HeaderProps {
  categories: Category[];
}

export default function Header({ categories }: HeaderProps) {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // إذا كان المستخدم مسجل دخول، لا نعرض النافبار
  if (isClient && session) {
    return null;
  }

  // تنظيم التصنيفات إلى رئيسية وفرعية
  const mainCategories = categories.filter((cat) => !('parentId' in cat) || (cat as { parentId?: number | null }).parentId === null);
  const subCategories = categories.filter((cat) => 'parentId' in cat && (cat as { parentId?: number | null }).parentId !== null);

  // دالة للحصول على التصنيفات الفرعية للتصنيف الرئيسي
  const getSubCategories = (parentId: string | number) => {
    const parentIdNum = typeof parentId === 'string' ? parseInt(parentId, 10) : parentId;
    return subCategories.filter((sub) => {
      if (!('parentId' in sub)) return false;
      const subParentId = (sub as { parentId?: number | string | null }).parentId;
      if (subParentId === null || subParentId === undefined) return false;
      const subParentIdNum = typeof subParentId === 'string' ? parseInt(subParentId, 10) : subParentId;
      return subParentIdNum === parentIdNum;
    });
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* الشعار */}
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center space-x-2 space-x-reverse"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">أ</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white arabic-heading">
                موقع الأخبار العربية
              </span>
            </Link>
          </div>

          {/* شريط التنقل - الشاشة الكبيرة */}
          <nav className="hidden md:flex gap-6 flex-row-reverse">
            {mainCategories.map((category) => {
              const categorySubCategories = getSubCategories(category.id);

              return (
                <div key={category.id} className="relative group">
                  <Link
                    href={`/category/${category.slug}`}
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center whitespace-nowrap"
                  >
                    {category.name}
                    {categorySubCategories.length > 0 && (
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    )}
                  </Link>

                  {/* Dropdown للتصنيفات الفرعية */}
                  {categorySubCategories.length > 0 && (
                    <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border border-gray-200 dark:border-gray-700">
                      <div className="py-2">
                        {categorySubCategories.map((subCategory) => (
                          <Link
                            key={subCategory.id}
                            href={`/category/${subCategory.slug}`}
                            className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                          >
                            {subCategory.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* زر القائمة المتنقلة */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 p-2"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* القائمة المتنقلة للهواتف */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              {mainCategories.map((category) => {
                const categorySubCategories = getSubCategories(category.id);

                return (
                  <div key={category.id} className="relative group">
                    <Link
                      href={`/category/${category.slug}`}
                      className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-between px-3 py-3 rounded-md text-base font-medium transition-colors border-b border-gray-100 dark:border-gray-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {category.name}
                      {categorySubCategories.length > 0 && (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      )}
                    </Link>

                    {/* التصنيفات الفرعية للهواتف - تظهر عند الهوفر فقط */}
                    {categorySubCategories.length > 0 && (
                      <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border border-gray-200 dark:border-gray-700">
                        <div className="py-2">
                          {categorySubCategories.map((subCategory) => (
                            <Link
                              key={subCategory.id}
                              href={`/category/${subCategory.slug}`}
                              className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {subCategory.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
