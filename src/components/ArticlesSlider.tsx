"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ApiArticle } from "@/lib/api";

interface ArticlesSliderProps {
  articles: ApiArticle[];
}

export default function ArticlesSlider({ articles }: ArticlesSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (articles.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % articles.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [articles.length]);

  if (articles.length === 0) {
    return (
      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl p-12 text-center">
        <p className="text-xl text-gray-600 dark:text-gray-400 arabic-text">
          لا توجد أخبار عاجلة متاحة
        </p>
      </div>
    );
  }

  const currentArticle = articles[currentSlide];
  const imageUrl =
    currentArticle.imageUrl ||
    `https://picsum.photos/1200/800?random=${currentArticle.id}`;

  return (
    <div className="relative w-full">
      {/* الخبر المميز */}
      <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] overflow-hidden rounded-xl mb-4">
        <Link href={`/news/${currentArticle.slug}`}>
          <div className="relative w-full h-full cursor-pointer">
            <Image
              src={imageUrl}
              alt={currentArticle.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 text-white">
              <div className="max-w-4xl mx-auto">
                <div className="mb-2 md:mb-4">
                  <span className="bg-red-600 text-white px-2 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold">
                    {currentArticle.categoryName}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-4 arabic-heading line-clamp-2">
                  {currentArticle.title}
                </h1>
                <p className="text-sm md:text-base lg:text-lg mb-3 md:mb-6 arabic-text line-clamp-2 md:line-clamp-3 text-gray-200">
                  {currentArticle.summary}
                </p>
                <div className="flex items-center space-x-3 md:space-x-6 space-x-reverse text-xs md:text-sm text-gray-300">
                  <div className="flex items-center space-x-1 md:space-x-2 space-x-reverse">
                    <span>👤</span>
                    <span>{currentArticle.authorName}</span>
                  </div>
                  <div className="flex items-center space-x-1 md:space-x-2 space-x-reverse">
                    <span>📅</span>
                    <span>
                      {new Date(currentArticle.publishedAt).toLocaleDateString(
                        "ar-EG"
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>

        <button
          onClick={() =>
            setCurrentSlide(
              (prev) => (prev - 1 + articles.length) % articles.length
            )
          }
          className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 md:p-3 rounded-full transition-colors text-lg md:text-xl"
        >
          ←
        </button>

        <button
          onClick={() =>
            setCurrentSlide((prev) => (prev + 1) % articles.length)
          }
          className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 md:p-3 rounded-full transition-colors text-lg md:text-xl"
        >
          →
        </button>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 space-x-reverse">
          {articles.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* الصور الصغيرة */}
      {articles.length > 1 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-4">
          {articles.slice(0, 4).map((article, index) => {
            const thumbImageUrl =
              article.imageUrl ||
              `https://picsum.photos/400/300?random=${article.id}`;
            return (
              <button
                key={article.id}
                onClick={() => setCurrentSlide(index)}
                className={`relative h-32 rounded-lg overflow-hidden transition-all ${
                  index === currentSlide
                    ? "ring-4 ring-blue-500 scale-105"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={thumbImageUrl}
                  alt={article.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <p className="absolute bottom-0 left-0 right-0 p-2 text-white text-xs font-medium arabic-heading line-clamp-2">
                  {article.title}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
