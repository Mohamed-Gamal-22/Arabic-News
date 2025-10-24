import Image from "next/image";

interface FeaturedNewsCardProps {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  category: string;
  publishDate: string;
  readTime: string;
}

export default function FeaturedNewsCard({
  id,
  title,
  summary,
  imageUrl,
  category,
  publishDate,
  readTime,
}: FeaturedNewsCardProps) {
  return (
    <article className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      <div className="relative h-80 w-full">
        <Image src={imageUrl} alt={title} fill className="object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
        <div className="absolute top-6 right-6">
          <span className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold">
            {category}
          </span>
        </div>
        <div className="absolute bottom-6 right-6 left-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-3 arabic-heading line-clamp-2">
            {title}
          </h1>
          <p className="text-gray-200 mb-4 arabic-text line-clamp-2">
            {summary}
          </p>
          <div className="flex items-center justify-between text-sm text-gray-300">
            <div className="flex items-center space-x-2 space-x-reverse">
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{readTime}</span>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>{publishDate}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
