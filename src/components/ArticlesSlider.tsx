"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ApiArticle } from "@/lib/api";

const SLIDER_MAX = 4;

interface ArticlesSliderProps {
  articles: ApiArticle[];
}

export default function ArticlesSlider({ articles }: ArticlesSliderProps) {
  const items = useMemo(
    () => articles.slice(0, Math.min(SLIDER_MAX, articles.length)),
    [articles]
  );

  const [currentSlide, setCurrentSlide] = useState(0);
  const [pause, setPause] = useState(false);

  useEffect(() => {
    setCurrentSlide(0);
  }, [items.length]);

  useEffect(() => {
    if (items.length <= 1 || pause) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [items.length, pause]);

  if (items.length === 0) {
    return (
      <div className="w-full rounded-2xl bg-gray-100 p-12 text-center dark:bg-gray-800">
        <p className="text-xl text-gray-600 dark:text-gray-400 arabic-text">
          لا توجد أخبار عاجلة متاحة
        </p>
      </div>
    );
  }

  const currentArticle = items[currentSlide];
  const imageUrl =
    currentArticle.imageUrl ||
    `https://picsum.photos/1200/800?random=${currentArticle.id}`;

  return (
    <div
      dir="rtl"
      className="mx-auto w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-900 shadow-2xl dark:border-gray-700"
      onMouseEnter={() => setPause(true)}
      onMouseLeave={() => setPause(false)}
    >
      <div className="flex min-h-[280px] flex-col lg:min-h-[360px] lg:flex-row">
        {/* المنطقة الرئيسية — على اليمين في RTL */}
        <div className="relative flex min-h-[240px] flex-[3] flex-col lg:min-h-[360px]">
          <Link
            href={`/news/${currentArticle.slug}`}
            className="relative min-h-[200px] w-full flex-1 lg:min-h-[280px]"
          >
            <div className="absolute inset-0">
              <Image
                src={imageUrl}
                alt={currentArticle.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 75vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
            </div>
            <span className="sr-only">{currentArticle.title}</span>
          </Link>

          {/* شريط سفلي: أرقام يسار الشاشة | فاصل | عنوان يمين */}
          <div
            dir="ltr"
            className="relative z-10 flex shrink-0 items-center gap-3 bg-black/80 px-3 py-3 sm:gap-4 sm:px-4 sm:py-4"
          >
            {items.length > 1 && (
              <>
                <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
                  {items.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentSlide(index);
                      }}
                      className={`flex h-8 w-8 items-center justify-center text-sm font-bold transition-colors sm:h-9 sm:w-9 ${
                        index === currentSlide
                          ? "bg-white text-gray-900"
                          : "bg-gray-700 text-white hover:bg-gray-600"
                      }`}
                      aria-label={`خبر ${index + 1}`}
                      aria-current={index === currentSlide}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                <div
                  className="hidden h-8 w-px shrink-0 bg-red-600 sm:block"
                  aria-hidden
                />
              </>
            )}

            <div dir="rtl" className="min-w-0 flex-1 pr-1 text-right">
              <span className="inline-block rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                {currentArticle.categoryName}
              </span>
              <h2 className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-white sm:text-base md:text-lg lg:text-xl arabic-heading">
                {currentArticle.title}
              </h2>
            </div>
          </div>
        </div>

        {/* القائمة الجانبية — على الشمال في RTL */}
        <div className="flex flex-[1] flex-col divide-y divide-gray-700/80 bg-gray-900 lg:max-w-[320px] lg:min-w-[240px]">
          {items.map((article, index) => {
            const thumb =
              article.imageUrl ||
              `https://picsum.photos/400/300?random=${article.id}`;
            const active = index === currentSlide;
            return (
              <button
                key={article.id}
                type="button"
                onClick={() => setCurrentSlide(index)}
                className={`flex w-full items-stretch gap-3 p-3 text-right transition-colors sm:p-3.5 ${
                  active
                    ? "bg-gray-800/90 ring-1 ring-inset ring-red-600/40"
                    : "bg-gray-900 hover:bg-gray-800/70"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] text-gray-400 sm:text-xs">
                    {article.categoryName}
                  </span>
                  <p className="mt-0.5 line-clamp-2 text-xs font-semibold text-white sm:text-sm arabic-heading">
                    {article.title}
                  </p>
                </div>
                <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md sm:h-[72px] sm:w-28">
                  <Image
                    src={thumb}
                    alt={article.title}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
