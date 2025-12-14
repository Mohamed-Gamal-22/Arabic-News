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
  } catch (error: unknown) {
    console.error("Error fetching articles:", error);
    return {
      pageIndex: 1,
      pageSize: 0,
      totalCount: 0,
      data: [],
    };
  }
};

// دالة للقبول مقال (الطريقة القديمة - للتوافق)
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
  } catch (error: unknown) {
    console.error("Error approving article:", error);
    throw error;
  }
};

// دالة جديدة للموافقة على المقال باستخدام Unpend endpoint
export const approveArticleUnpend = async (
  articleId: number,
  articleData: {
    Title: string;
    Content: string;
    Summary: string;
    Slug: string;
    CategoryId: number;
    IsTrending: boolean;
    TrendPeriodInDays: number;
    IsPending: boolean;
  },
  token: string
): Promise<void> => {
  try {
    const response = await fetch(
      `https://newswebsite.runasp.net/api/article/Unpend/${articleId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(articleData),
      }
    );

    if (!response.ok) {
      // محاولة قراءة رسالة الخطأ
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.title || errorMessage;
      } catch {
        // Ignore JSON parse errors, use default errorMessage
        // إذا لم يكن هناك JSON في الرد
        const text = await response.text();
        if (text) errorMessage = text;
      }
      throw new Error(errorMessage || "فشل في الموافقة على المقال");
    }
    // Response 204 No Content - لا يوجد body
  } catch (error: unknown) {
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
  } catch (error: unknown) {
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
  } catch (error: unknown) {
    console.error("Error deleting article:", error);
    throw error;
  }
};
