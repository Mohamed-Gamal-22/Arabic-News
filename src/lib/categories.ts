// Server Action لجلب التصنيفات
export async function getCategoriesServer() {
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
    return data;
  } catch (error) {
    console.error("Error fetching categories in server:", error);
    // إرجاع تصنيفات ثابتة في حالة فشل الـ API
    return [
      {
        id: 1,
        name: "Technology",
        slug: "technology",
        description: "Technology news",
        parentId: null,
      },
      {
        id: 2,
        name: "Sports",
        slug: "sports",
        description: "Sports news",
        parentId: null,
      },
      {
        id: 3,
        name: "Politics",
        slug: "politics",
        description: "Politics news",
        parentId: null,
      },
      {
        id: 4,
        name: "Football",
        slug: "football",
        description: "Football news",
        parentId: 2,
      },
    ];
  }
}
