"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faChevronLeft,
//   faChevronRight,
//   faClock,
//   faCalendar,
// } from "@fortawesome/free-solid-svg-icons";
import { Card, CardContent } from "@/components/ui/card";

interface TrendingNewsSliderProps {
  articles: Array<{
    id: string;
    title: string;
    summary: string;
    imageUrl: string;
    category: string;
    publishDate: string;
    readTime: string;
    slug: string;
  }>;
}

export default function TrendingNewsSlider({
  articles,
}: TrendingNewsSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // التبديل التلقائي
  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % articles.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [articles.length, isAutoPlay]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % articles.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + articles.length) % articles.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  if (articles.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full h-[500px] overflow-hidden rounded-xl">
      {/* السلايدر الرئيسي */}
      <div className="relative w-full h-full">
        {articles.map((article, index) => (
          <div
            key={article.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="relative w-full h-full">
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                className="object-cover"
                priority={index === 0}
              />

              {/* تدرج لوني */}
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />

              {/* المحتوى */}
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <div className="max-w-4xl mx-auto">
                  {/* الفئة */}
                  <div className="mb-4">
                    <span className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                      {article.category}
                    </span>
                  </div>

                  {/* العنوان */}
                  <h1 className="text-3xl md:text-4xl font-bold mb-4 arabic-heading line-clamp-2">
                    {article.title}
                  </h1>

                  {/* الملخص */}
                  <p className="text-lg mb-6 arabic-text line-clamp-3 text-gray-200">
                    {article.summary}
                  </p>

                  {/* معلومات إضافية */}
                  <div className="flex items-center space-x-6 space-x-reverse text-sm text-gray-300">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <span>⏰</span>
                      <span>{article.readTime}</span>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <span>📅</span>
                      <span>{article.publishDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* أزرار التنقل */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
        onMouseEnter={() => setIsAutoPlay(false)}
        onMouseLeave={() => setIsAutoPlay(true)}
      >
        ←
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
        onMouseEnter={() => setIsAutoPlay(false)}
        onMouseLeave={() => setIsAutoPlay(true)}
      >
        →
      </button>

      {/* مؤشرات الصفحات */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 space-x-reverse">
        {articles.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? "bg-white" : "bg-white/50"
            }`}
            onMouseEnter={() => setIsAutoPlay(false)}
            onMouseLeave={() => setIsAutoPlay(true)}
          />
        ))}
      </div>

      {/* شريط التقدم */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
        <div
          className="h-full bg-red-600 transition-all duration-100"
          style={{
            width: `${((currentSlide + 1) / articles.length) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}
