"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ApiArticle } from "@/lib/api";

interface ArticleCardProps {
  article: ApiArticle;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const imageUrl =
    article.imageUrl || `https://picsum.photos/800/600?random=${article.id}`;

  return (
    <Link href={`/news/${article.slug}`}>
      <Card className="h-full hover:shadow-xl transition-shadow cursor-pointer overflow-hidden group">
        <div className="relative w-full h-48 overflow-hidden">
          <Image
            src={imageUrl}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute top-4 right-4">
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
              {article.categoryName}
            </span>
          </div>
        </div>

        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 arabic-heading line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {article.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 arabic-text line-clamp-3 mb-4">
            {article.summary}
          </p>
        </CardContent>

        <CardFooter className="px-6 pb-6 pt-0 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-2 space-x-reverse">
            <span>👤</span>
            <span>{article.authorName}</span>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <span>📅</span>
            <span>
              {new Date(article.publishedAt).toLocaleDateString("ar-EG")}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
















