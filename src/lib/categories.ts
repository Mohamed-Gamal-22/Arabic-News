import { Category } from "@/lib/api";

// Server Action لجلب التصنيفات
export async function getCategoriesServer(): Promise<Category[]> {
  try {
    const response = await fetch(
      "https://newswebsite.runasp.net/api/category",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as Category[];
  } catch (error: unknown) {
    console.error("Error fetching categories in server:", error);
    // إرجاع تصنيفات ثابتة في حالة فشل الـ API
    return [
      {
        id: "1",
        name: "Technology",
        slug: "technology",
        description: "Technology news",
      },
      {
        id: "2",
        name: "Sports",
        slug: "sports",
        description: "Sports news",
      },
      {
        id: "3",
        name: "Politics",
        slug: "politics",
        description: "Politics news",
      },
      {
        id: "4",
        name: "Football",
        slug: "football",
        description: "Football news",
      },
    ];
  }
}






















