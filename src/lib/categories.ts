import { Category } from "@/lib/api";

// Cache للتصنيفات (في production يمكن استخدام Redis أو Next.js cache)
let categoriesCache: Category[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 دقائق

// Server Action لجلب التصنيفات مع caching
export async function getCategoriesServer(): Promise<Category[]> {
  // التحقق من الـ cache
  const now = Date.now();
  if (categoriesCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return categoriesCache;
  }

  try {
    const response = await fetch(
      "https://newswebsite.runasp.net/api/category",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // استخدام Next.js cache
        next: { revalidate: 300 }, // إعادة التحقق كل 5 دقائق
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const categories = data as Category[];
    
    // تحديث الـ cache
    categoriesCache = categories;
    cacheTimestamp = now;
    
    return categories;
  } catch (error: unknown) {
    console.error("Error fetching categories in server:", error);
    
    // إذا كان هناك cache قديم، نستخدمه
    if (categoriesCache) {
      console.warn("Using cached categories due to API error");
      return categoriesCache;
    }
    
    // إرجاع تصنيفات ثابتة في حالة فشل الـ API وعدم وجود cache
    return [
      {
        id: "1",
        name: "Technology",
        slug: "technology",
        description: "Technology news",
        parentId: null,
      },
      {
        id: "2",
        name: "Sports",
        slug: "sports",
        description: "Sports news",
        parentId: null,
      },
      {
        id: "3",
        name: "Politics",
        slug: "politics",
        description: "Politics news",
        parentId: null,
      },
      {
        id: "4",
        name: "Football",
        slug: "football",
        description: "Football news",
        parentId: 2, // مثال: Football هو سابكاتيجوري لـ Sports
      },
    ];
  }
}
