"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth";
import { Category } from "@/lib/api";

interface HeaderProps {
  categories?: Category[] | null;
  /** من الخادم ليتطابق أول render مع الـ HTML المُصدَّر (تقليل أخطاء hydration). */
  session?: Session | null;
}

const AUTH_NAV_HOME_CLASS =
  "inline-flex items-center justify-center rounded-md border-0 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 whitespace-nowrap";
const AUTH_NAV_DASHBOARD_CLASS =
  "inline-flex items-center justify-center rounded-md border-0 bg-green-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500 whitespace-nowrap";

/** سلاسل ثابتة حتى لا يختلف ترتيب الـ classes بين SSR والعميل (hydration). */
/** صف ltr: الكتلة اليسرى = الروابط، اليمين = اللوجو */
const HEADER_BAR_ROW_CLASS =
  "flex w-full items-center justify-between gap-3 h-16";
const HEADER_NAV_CLUSTER_CLASS =
  "flex flex-1 min-w-0 items-center justify-start gap-2 sm:gap-3";
/**
 * flex + dir="ltr" على الـ nav: المجموعة تُحاذى لليسار (بعيد عن اللوجو).
 * النص العربي يُضبط بـ dir="rtl" على كل رابط.
 */
const HEADER_DESKTOP_NAV_CLASS =
  "hidden min-w-0 flex-1 flex-row justify-start gap-3 md:flex" as const;
const HEADER_MOBILE_TRIGGER_WRAP_CLASS = "shrink-0 md:hidden";

/** أقصى تصنيفات رئيسية في الشريط؛ الباقي يظهر تحت «المزيد». */
const MAX_INLINE_CATEGORIES = 6;

const DESKTOP_CATEGORY_LINK_CLASS =
  "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center whitespace-nowrap";

function DesktopNavCategory({
  category,
  getSubCategories,
}: {
  category: Category;
  getSubCategories: (parentId: string | number) => Category[];
}) {
  const categorySubCategories = getSubCategories(category.id);

  return (
    <div className="relative shrink-0 group">
      <Link
        href={`/category/${category.slug}`}
        className={DESKTOP_CATEGORY_LINK_CLASS}
        dir="rtl"
      >
        {category.name}
        {categorySubCategories.length > 0 && (
          <svg
            className="w-4 h-4 mr-1 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
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

      {categorySubCategories.length > 0 && (
        <div
          className="absolute top-full start-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border border-gray-200 dark:border-gray-700"
          dir="rtl"
        >
          <div className="py-2">
            {categorySubCategories.map((subCategory) => (
              <Link
                key={subCategory.id}
                href={`/category/${subCategory.slug}`}
                className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                dir="rtl"
              >
                {subCategory.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** عناصر داخل «المزيد»: رئيسي + فرعيات مدرجة. */
function MoreMenuCategoryBlock({
  category,
  getSubCategories,
}: {
  category: Category;
  getSubCategories: (parentId: string | number) => Category[];
}) {
  const subs = getSubCategories(category.id);

  return (
    <div className="border-b border-gray-100 dark:border-gray-600 last:border-b-0 py-1">
      <Link
        href={`/category/${category.slug}`}
        className="block px-3 py-2 text-sm font-medium text-gray-800 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 rounded-md"
      >
        {category.name}
      </Link>
      {subs.length > 0 && (
        <div className="pr-2 pb-1">
          {subs.map((sub) => (
            <Link
              key={sub.id}
              href={`/category/${sub.slug}`}
              className="block pr-4 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              {sub.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Header({
  categories,
  session: sessionFromServer,
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: sessionClient } = useSession();
  const session = sessionClient ?? sessionFromServer ?? null;
  const showAuthNav = Boolean(session?.user);

  const categoryList = Array.isArray(categories) ? categories : [];

  // تنظيم التصنيفات إلى رئيسية وفرعية
  const mainCategories = categoryList.filter(
    (cat) => !cat.parentId || cat.parentId === null
  );
  const subCategories = categoryList.filter(
    (cat) => cat.parentId && cat.parentId !== null
  );

  // دالة للحصول على التصنيفات الفرعية للتصنيف الرئيسي
  const getSubCategories = (parentId: string | number) => {
    const parentIdNum = typeof parentId === 'string' ? parseInt(parentId, 10) : parentId;
    return subCategories.filter((sub) => {
      if (!sub.parentId) return false;
      const subParentIdNum = typeof sub.parentId === 'string' ? parseInt(sub.parentId, 10) : sub.parentId;
      return subParentIdNum === parentIdNum;
    });
  };

  const visibleCategories = mainCategories.slice(0, MAX_INLINE_CATEGORIES);
  const overflowCategories = mainCategories.slice(MAX_INLINE_CATEGORIES);
  const showMoreDropdown = overflowCategories.length > 0;

  return (
    <header className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700 pb-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={HEADER_BAR_ROW_CLASS} dir="ltr">
          {/* يسار الشاشة: الروابط ثم أزرار الحساب والهامبرغر */}
          <div className={HEADER_NAV_CLUSTER_CLASS}>
            {showAuthNav ? (
              <div
                className="flex shrink-0 items-center gap-2 flex-row-reverse"
                dir="rtl"
              >
                <Link href="/dashboard" className={AUTH_NAV_DASHBOARD_CLASS}>
                  الداشبورد
                </Link>
                <Link href="/" className={AUTH_NAV_HOME_CLASS}>
                  الصفحة الرئيسية
                </Link>
              </div>
            ) : null}

            {/* شريط التنقل — ltr للمحاذاة اليسار؛ الروابط rtl للنص */}
            <nav
              className={HEADER_DESKTOP_NAV_CLASS}
              aria-label="أقسام الموقع"
              dir="ltr"
            >
            {visibleCategories.map((category) => (
              <DesktopNavCategory
                key={category.id}
                category={category}
                getSubCategories={getSubCategories}
              />
            ))}

            {showMoreDropdown && (
              <div className="relative shrink-0 group">
                <button
                  type="button"
                  className={`${DESKTOP_CATEGORY_LINK_CLASS} border-0 bg-transparent cursor-pointer`}
                  aria-haspopup="menu"
                  dir="rtl"
                >
                  المزيد
                  <svg
                    className="w-4 h-4 mr-1 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <div
                  className="absolute top-full start-0 mt-1 max-h-[min(70vh,24rem)] w-64 overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border border-gray-200 dark:border-gray-700"
                  dir="rtl"
                >
                  <div className="py-1">
                    {overflowCategories.map((category) => (
                      <MoreMenuCategoryBlock
                        key={category.id}
                        category={category}
                        getSubCategories={getSubCategories}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            </nav>

            {/* زر القائمة المتنقلة */}
            <div className={HEADER_MOBILE_TRIGGER_WRAP_CLASS}>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 p-2"
                aria-expanded={isMobileMenuOpen}
                aria-label="فتح القائمة"
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

          {/* يمين الشاشة: الشعار */}
          <div className="flex items-center min-w-0 shrink-0">
            <Link href="/" className="flex items-center">
              <div className="w-48 h-48 flex items-center justify-center mb-2">
                <Image
                  src="/logo.png"
                  alt="موقع الأخبار العربية"
                  width={192}
                  height={192}
                  className="object-contain"
                />
              </div>
            </Link>
          </div>
        </div>

        {/* القائمة المتنقلة للهواتف */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              {showAuthNav && (
                <div className="flex flex-col gap-2 pb-3 mb-2 border-b border-gray-200 dark:border-gray-600">
                  <Link
                    href="/"
                    className={`${AUTH_NAV_HOME_CLASS} w-full justify-center`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    الصفحة الرئيسية
                  </Link>
                  <Link
                    href="/dashboard"
                    className={`${AUTH_NAV_DASHBOARD_CLASS} w-full justify-center`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    الداشبورد
                  </Link>
                </div>
              )}
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
