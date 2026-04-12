// إعدادات الـ API
export const API_CONFIG = {
  BASE_URL:
    process.env.NEXT_PUBLIC_API_URL || "https://newswebsite.runasp.net/api",
  TIMEOUT: 10000,
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

// نقاط النهاية (Endpoints)
export const API_ENDPOINTS = {
  // المصادقة
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  REFRESH_TOKEN: "/auth/refresh",

  // المستخدمين
  USERS: "/users",
  USER_PROFILE: "/users/profile",
  CREATE_USER: "/users",
  UPDATE_USER: "/users",
  DELETE_USER: "/users",

  // المقالات
  ARTICLES: "/articles",
  ARTICLE_BY_ID: "/articles",
  ARTICLE_BY_SLUG: "/articles/slug",
  CREATE_ARTICLE: "/articles",
  UPDATE_ARTICLE: "/articles",
  DELETE_ARTICLE: "/articles",

  // الفئات
  CATEGORIES: "/category",
  SUBCATEGORIES: "/subcategories",

  // المقالات من API الجديد
  ARTICLE: "/article",

  // الأخبار التريندينج
  TRENDING_ARTICLES: "/articles/trending",

  // الإحصائيات
  DASHBOARD_STATS: "/dashboard/stats",
  WRITER_STATS: "/dashboard/writer-stats",
  ADMIN_STATS: "/dashboard/admin-stats",
  
  // المستخدم الحالي
  CURRENT_USER: "/authentication/me",
};

// أنواع الاستجابات
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

// أنواع المستخدمين
export type UserRole = "writer" | "admin" | "super_admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// واجهة User من الـ API الجديد
export interface ApiUser {
  id: string;
  userName: string;
  email: string;
  displayName: string;
  phoneNumber: string | null;
  nationalId: string | null;
  fullName: string;
  imageUrl: string | null;
  roles: string[];
  categoryIds: number[];
  categories: Array<{
    id: number;
    name: string;
    slug: string;
    description: string | null;
    parentId: number | null;
  }>;
}

// أنواع المقالات
export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  featuredImage: string;
  category: string;
  subcategory?: string;
  tags?: string[];
  status: "draft" | "pending" | "published" | "rejected";
  isTrending: boolean;
  trendingUntil?: string;
  authorId: string;
  author: User;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// أنواع الفئات
export interface Category {
  id: string | number;
  name: string;
  slug: string;
  description?: string;
  parentId?: number | null; // إضافة parentId لدعم السابكاتيجوري
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
}

// أنواع الإحصائيات
export interface DashboardStats {
  totalArticles: number;
  publishedArticles: number;
  pendingArticles: number;
  draftArticles: number;
  rejectedArticles: number;
  trendingArticles: number;
  totalUsers: number;
  totalWriters: number;
  totalAdmins: number;
}

// أنواع النماذج
export interface LoginRequest {
  Email: string;
  Password: string;
}

export interface LoginResponse {
  email: string;
  displayName: string;
  token: string;
}

export interface CreateArticleRequest {
  title: string;
  summary: string;
  content: string;
  category: string;
  subcategory?: string;
  tags?: string[];
  featuredImage: string;
  status: "draft" | "pending";
}

export interface UpdateArticleRequest extends Partial<CreateArticleRequest> {
  id: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {
  id: string;
}

// دوال مساعدة للـ API
export const apiRequest = async <T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      ...API_CONFIG.HEADERS,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "حدث خطأ في الطلب");
    }

    return data;
  } catch (error: unknown) {
    console.error("خطأ في API:", error);
    throw error;
  }
};

// دالة للحصول على التوكن من localStorage
export const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken");
  }
  return null;
};

// دالة لإضافة التوكن للطلبات
export const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// واجهة Article من الـ API
export interface ApiArticle {
  id: number;
  title: string;
  summary: string;
  content: string;
  slug: string;
  authorId: string;
  keywords: string | null;
  authorName: string;
  publishedAt: string;
  isTrending: boolean;
  isPending: boolean;
  categoryName: string;
  imageUrl: string | null;
}

// واجهة Articles Response
export interface ArticlesResponse {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  data: ApiArticle[];
}

/**
 * يطابق استجابة الـ API سواء كانت الحقول camelCase أو PascalCase (مثل Summary).
 * بدون ذلك يبقى summary فارغاً في الواجهة بينما يظهر الملخص في الـ meta من مسارات أخرى.
 */
export function normalizeApiArticle(raw: unknown): ApiArticle {
  if (raw === null || typeof raw !== "object") {
    return {
      id: 0,
      title: "",
      summary: "",
      content: "",
      slug: "",
      authorId: "",
      keywords: null,
      authorName: "",
      publishedAt: "",
      isTrending: false,
      isPending: false,
      categoryName: "",
      imageUrl: null,
    };
  }
  const r = raw as Record<string, unknown>;
  const pickStr = (camel: string, pascal: string, def = ""): string => {
    const v = r[camel] ?? r[pascal];
    if (v === null || v === undefined) return def;
    return String(v);
  };
  const pickNum = (camel: string, pascal: string): number => {
    const v = r[camel] ?? r[pascal];
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };
  const pickBool = (camel: string, pascal: string): boolean => {
    const v = r[camel] ?? r[pascal];
    if (typeof v === "boolean") return v;
    return Boolean(v);
  };
  const pickNullStr = (camel: string, pascal: string): string | null => {
    const v = r[camel] ?? r[pascal];
    if (v === null || v === undefined) return null;
    return String(v);
  };

  return {
    id: pickNum("id", "Id"),
    title: pickStr("title", "Title"),
    summary: pickStr("summary", "Summary"),
    content: pickStr("content", "Content"),
    slug: pickStr("slug", "Slug"),
    authorId: pickStr("authorId", "AuthorId"),
    keywords: pickNullStr("keywords", "Keywords"),
    authorName: pickStr("authorName", "AuthorName"),
    publishedAt: pickStr("publishedAt", "PublishedAt"),
    isTrending: pickBool("isTrending", "IsTrending"),
    isPending: pickBool("isPending", "IsPending"),
    categoryName: pickStr("categoryName", "CategoryName"),
    imageUrl: pickNullStr("imageUrl", "ImageUrl"),
  };
}

function normalizeArticlesResponse(raw: unknown): ArticlesResponse {
  if (raw === null || typeof raw !== "object") {
    return { pageIndex: 1, pageSize: 0, totalCount: 0, data: [] };
  }
  const d = raw as Record<string, unknown>;
  const list = d.data ?? d.Data;
  const items = Array.isArray(list)
    ? list.map((item) => normalizeApiArticle(item))
    : [];
  const pickNum = (camel: string, pascal: string, def: number) => {
    const v = d[camel] ?? d[pascal];
    const n = Number(v);
    return Number.isFinite(n) ? n : def;
  };
  return {
    pageIndex: pickNum("pageIndex", "PageIndex", 1),
    pageSize: pickNum("pageSize", "PageSize", 0),
    totalCount: pickNum("totalCount", "TotalCount", 0),
    data: items,
  };
}

// دالة لجلب المقالات
export const getArticles = async (
  pageIndex: number = 1,
  pageSize: number = 10,
  isTrending?: boolean,
  token?: string,
  isPending?: boolean
): Promise<ArticlesResponse> => {
  try {
    // التأكد من إرسال pageSize بشكل صحيح
    // استخدام ?? بدلاً من || لأن 0 هو قيمة صالحة
    const finalPageSize = pageSize && pageSize > 0 ? pageSize : 10; // default 10 إذا لم يتم تحديده
    let url = `https://newswebsite.runasp.net/api/article?pageIndex=${pageIndex}&pageSize=${finalPageSize}`;

    console.log("=== getArticles API Call ===");
    console.log("PageIndex:", pageIndex);
    console.log("PageSize parameter:", pageSize);
    console.log("FinalPageSize:", finalPageSize);
    console.log("Full URL:", url);

    if (isTrending !== undefined) {
      url += `&IsTrending=${isTrending}`;
    }

    if (isPending !== undefined) {
      url += `&IsPending=${isPending}`;
    }

    console.log("Fetching articles from:", url);

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // إضافة التوكن إذا كان متوفر
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      cache: "no-store",
      headers,
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Articles data received:", data);
    return normalizeArticlesResponse(data);
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

// دالة لجلب مقال واحد بالـ ID
export const getArticleById = async (
  id: number,
  token?: string
): Promise<ApiArticle | null> => {
  try {
    const url = `https://newswebsite.runasp.net/api/article/${id}`;
    console.log("Fetching article by ID from:", url);

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // إضافة التوكن إذا كان متوفر
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      cache: "no-store",
      headers,
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Article data received:", data);
    return normalizeApiArticle(data);
  } catch (error: unknown) {
    console.error("Error fetching article:", error);
    return null;
  }
};

// دالة لجلب مقال واحد بالـ Slug
export const getArticleBySlug = async (
  slug: string,
  token?: string
): Promise<ApiArticle | null> => {
  try {
    const url = `https://newswebsite.runasp.net/api/article/slug/${slug}`;
    console.log("Fetching article by slug from:", url);

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // إضافة التوكن إذا كان متوفر
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      cache: "no-store",
      headers,
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Article data received:", data);
    return normalizeApiArticle(data);
  } catch (error: unknown) {
    console.error("Error fetching article by slug:", error);
    return null;
  }
};

// دالة لتحديث مقال
export const updateArticle = async (
  articleId: string,
  articleData: {
    Title: string;
    Content: string;
    Summary: string;
    Slug: string;
    CategoryId: string;
  },
  token: string
): Promise<ApiArticle | null> => {
  try {
    const url = `https://newswebsite.runasp.net/api/article/${articleId}`;
    console.log("=== Updating Article ===");
    console.log("URL:", url);
    console.log("Article ID:", articleId);
    console.log("Article Data:", articleData);

    // إنشاء FormData بدلاً من JSON
    const formDataToSend = new FormData();
    formDataToSend.append("Title", articleData.Title);
    formDataToSend.append("content", articleData.Content);
    formDataToSend.append("summary", articleData.Summary);
    formDataToSend.append("slug", articleData.Slug);
    formDataToSend.append("categoryId", articleData.CategoryId);

    // طباعة FormData للتحقق
    console.log("FormData entries:");
    for (const [key, value] of formDataToSend.entries()) {
      console.log(`  ${key}:`, value);
    }

    console.log("=== Sending PUT Request ===");
    console.log("Token:", token ? `${token.substring(0, 20)}...` : "Missing");
    
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        // لا نضيف Content-Type مع FormData - المتصفح يضيفه تلقائياً
      },
      body: formDataToSend,
    });

    console.log("=== Response Received ===");
    console.log("Response status:", response.status);
    console.log("Response OK:", response.ok);
    console.log("Response statusText:", response.statusText);

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      let errorDetails: unknown = null;

      try {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          errorDetails = await response.json();
          console.log("Error response JSON:", errorDetails);

          // إذا كان هناك validation errors، نعرضها بشكل واضح مع ترجمة للعربي
          if (
            errorDetails &&
            typeof errorDetails === "object" &&
            "errors" in errorDetails &&
            errorDetails.errors &&
            typeof errorDetails.errors === "object"
          ) {
            const errorDetailsObj = errorDetails as { errors: Record<string, unknown> };
            const fieldNames: Record<string, string> = {
              'Title': 'العنوان',
              'Content': 'المحتوى',
              'Summary': 'الملخص',
              'Slug': 'الرابط',
              'CategoryId': 'القسم',
              'Image': 'الصورة',
              'Keywords': 'الكلمات المفتاحية',
            };
            
            const validationErrors: string[] = [];
            Object.keys(errorDetailsObj.errors).forEach((field) => {
              const fieldErrors = errorDetailsObj.errors[field];
              const arabicFieldName = fieldNames[field] || field;
              if (Array.isArray(fieldErrors)) {
                fieldErrors.forEach((err: unknown) => {
                  if (typeof err === "string") {
                    validationErrors.push(`❌ ${arabicFieldName}: ${err}`);
                  }
                });
              }
            });
            if (validationErrors.length > 0) {
              errorMessage = validationErrors.join("\n");
            } else {
              const errorObj = errorDetails as Record<string, unknown>;
              errorMessage =
                (typeof errorObj.title === "string" ? errorObj.title : null) ||
                (typeof errorObj.message === "string" ? errorObj.message : null) ||
                errorMessage;
            }
          } else {
            const errorObj = errorDetails as Record<string, unknown>;
            errorMessage =
              (typeof errorObj.title === "string" ? errorObj.title : null) ||
              (typeof errorObj.message === "string" ? errorObj.message : null) ||
              errorMessage;
          }
        } else {
          const text = await response.text();
          console.log("Error response text:", text);
          errorMessage = text || errorMessage;
        }
      } catch (e: unknown) {
        console.error("Error reading error response:", e);
      }

      throw new Error(errorMessage);
    }

    // التحقق من أن الـ response يحتوي على محتوى
    const contentType = response.headers.get("content-type");
    const contentLength = response.headers.get("content-length");
    
    // إذا كان الـ response فارغ (204 No Content) أو لا يحتوي على محتوى
    if (response.status === 204 || contentLength === "0" || !contentType?.includes("application/json")) {
      console.log("✅ Article updated successfully (No Content response)");
      // محاولة جلب المقال المحدث
      try {
        const updatedArticle = await getArticleById(parseInt(articleId), token);
        return updatedArticle;
      } catch {
        console.log("Could not fetch updated article, returning success");
        return null; // أو يمكن إرجاع object فارغ
      }
    }

    // إذا كان الـ response يحتوي على JSON
    try {
      const text = await response.text();
      if (!text || text.trim() === "") {
        console.log("✅ Article updated successfully (Empty response)");
        // محاولة جلب المقال المحدث
        try {
          const updatedArticle = await getArticleById(parseInt(articleId), token);
          return updatedArticle;
        } catch {
          return null;
        }
      }
      
      const data = JSON.parse(text);
      console.log("✅ Article updated successfully:", data);
      return data;
    } catch (parseError: unknown) {
      console.error("Error parsing response:", parseError);
      // محاولة جلب المقال المحدث كـ fallback
      try {
        const updatedArticle = await getArticleById(parseInt(articleId), token);
        return updatedArticle;
      } catch {
        throw new Error("فشل تحديث المقال");
      }
    }
  } catch (error: unknown) {
    console.error("Error updating article:", error);
    throw error; // رمي الـ error بدل إرجاع null
  }
};

// دالة لإنشاء مقال جديد
export const createArticle = async (
  formData: FormData,
  token: string
): Promise<ApiArticle | null> => {
  try {
    const url = `https://newswebsite.runasp.net/api/article`;
    console.log("=== Creating Article ===");
    console.log("URL:", url);
    console.log("Token:", token ? `${token.substring(0, 20)}...` : "Missing");

    // طباعة بيانات FormData للتحقق
    console.log("FormData entries:");
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(
          `  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`
        );
      } else {
        console.log(`  ${key}:`, value);
      }
    }

    console.log("Making POST request...");
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // لا تضف Content-Type مع FormData - المتصفح هيكبشه تلقائياً
      },
      body: formData,
    });

    console.log("Response status:", response.status);
    console.log("Response status text:", response.statusText);
    console.log("Response OK:", response.ok);

    if (!response.ok) {
      // محاولة قراءة رسالة الخطأ
      let errorMessage = `HTTP error! status: ${response.status}`;
      let errorDetails = "";

      try {
        // قراءة النص
        const text = await response.text();
        console.log("Error response text:", text);
        console.log("Error response text length:", text.length);
        errorDetails = text;

        // محاولة تحليله كـ JSON
        if (text && text.length > 0 && text.trim().startsWith("{")) {
          try {
            const errorData = JSON.parse(text);
            console.log(
              "Error response JSON:",
              JSON.stringify(errorData, null, 2)
            );

            if (errorData.errors) {
              // معالجة أخطاء التحقق من الـ API مع ترجمة أسماء الحقول
              const fieldNames: Record<string, string> = {
                'Title': 'العنوان',
                'Content': 'المحتوى',
                'Summary': 'الملخص',
                'Slug': 'الرابط',
                'CategoryId': 'القسم',
                'Image': 'الصورة',
                'Keywords': 'الكلمات المفتاحية',
              };
              
              const errorMessages = Object.entries(errorData.errors)
                .map(([field, errors]) => {
                  const errorArray = Array.isArray(errors) ? errors : [errors];
                  const arabicFieldName = fieldNames[field] || field;
                  return `❌ ${arabicFieldName}: ${errorArray.join(", ")}`;
                })
                .join("\n");
              errorMessage = errorMessages;
            } else if (errorData.title) {
              errorMessage = errorData.title;
            } else if (errorData.message) {
              errorMessage = errorData.message;
            } else if (errorData.detail) {
              errorMessage = errorData.detail;
            } else if (errorData.error) {
              errorMessage = errorData.error;
            } else {
              errorMessage = text;
            }
          } catch (parseError: unknown) {
            console.error("JSON Parse Error:", parseError);
            errorMessage = text || `Bad Request (${response.status})`;
          }
        } else {
          errorMessage = text || `Bad Request (${response.status})`;
        }
      } catch (err: unknown) {
        console.error("Error reading error response:", err);
        errorMessage = `Bad Request (${response.status})`;
      }

      console.error("=== ERROR DETAILS ===");
      console.error("Status:", response.status);
      console.error("Message:", errorMessage);
      console.error("Details:", errorDetails);
      console.error("Full Error Response:", JSON.stringify(errorDetails, null, 2));

      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("Article created:", data);
    return data;
  } catch (error: unknown) {
    console.error("Error creating article:", error);
    throw error;
  }
};

// Export getCurrentUser from superAdminApi for backward compatibility
export { getCurrentUser } from "@/lib/superAdminApi";

// Type alias for CurrentUserProfile
export type CurrentUserProfile = ApiUser;

// دالة لجلب بيانات المستخدم الحالي
export const getCurrentUserMe = async (token: string): Promise<ApiUser | null> => {
  try {
    const url = `https://newswebsite.runasp.net/api/authentication/me`;
    console.log("Fetching current user from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Current user data received:", data);
    console.log("User categories:", data.categories);
    console.log("User categoryIds:", data.categoryIds);
    return data;
  } catch (error: unknown) {
    console.error("Error fetching current user:", error);
    return null;
  }
};

// دالة لجلب التصنيفات
export const getCategories = async (): Promise<Category[]> => {
  try {
    const url = `https://newswebsite.runasp.net/api/category`;
    console.log("Fetching categories from:", url);

    const response = await fetch(url);

    console.log("Response status:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Categories data received:", data);
    return data;
  } catch (error: unknown) {
    console.error("Error fetching categories:", error);
    // إرجاع مصفوفة فارغة بدلاً من إلقاء الخطأ
    return [];
  }
};
