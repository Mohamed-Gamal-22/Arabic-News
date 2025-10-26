// دالة لجلب المقالات في Server Components
export const getArticlesServer = async (
  pageIndex = 1,
  pageSize = 10,
  isTrending?: boolean
) => {
  try {
    let url = `https://newswebsite.runasp.net/api/article?pageIndex=${pageIndex}&pageSize=${pageSize}`;

    if (isTrending !== undefined) {
      url += `&IsTrending=${isTrending}`;
    }

    const response = await fetch(url, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching articles:", error);
    return {
      pageIndex: 1,
      pageSize: 0,
      totalCount: 0,
      data: [],
    };
  }
};

// دالة للقبول مقال
export const approveArticle = async (
  articleId: number,
  token: string
): Promise<void> => {
  try {
    const response = await fetch(
      `https://newswebsite.runasp.net/api/article/${articleId}/approve`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "فشل في قبول المقال");
    }
  } catch (error) {
    console.error("Error approving article:", error);
    throw error;
  }
};

// دالة لرفض مقال
export const rejectArticle = async (
  articleId: number,
  token: string,
  reason?: string
): Promise<void> => {
  try {
    const response = await fetch(
      `https://newswebsite.runasp.net/api/article/${articleId}/reject`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "فشل في رفض المقال");
    }
  } catch (error) {
    console.error("Error rejecting article:", error);
    throw error;
  }
};

// دالة لحذف مقال
export const deleteArticle = async (
  articleId: number,
  token: string
): Promise<void> => {
  try {
    const response = await fetch(
      `https://newswebsite.runasp.net/api/article/${articleId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "فشل في حذف المقال");
    }
  } catch (error) {
    console.error("Error deleting article:", error);
    throw error;
  }
};
