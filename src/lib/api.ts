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
export interface ApiResponse<T = any> {
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
  id: string;
  name: string;
  slug: string;
  description?: string;
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
export const apiRequest = async <T = any>(
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
  } catch (error) {
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
    const finalPageSize = pageSize || 5; // default 5 إذا لم يتم تحديده
    let url = `https://newswebsite.runasp.net/api/article?pageIndex=${pageIndex}&pageSize=${finalPageSize}`;

    console.log("=== getArticles API Call ===");
    console.log("PageIndex:", pageIndex);
    console.log("PageSize:", finalPageSize);
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
    return data;
  } catch (error) {
    console.error("Error fetching article:", error);
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

    console.log("Gemy debug FormDataToSend", formDataToSend);

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
      let errorDetails: any = null;

      try {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          errorDetails = await response.json();
          console.log("Error response JSON:", errorDetails);

          // إذا كان هناك validation errors، نعرضها بشكل واضح مع ترجمة للعربي
          if (errorDetails.errors) {
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
            Object.keys(errorDetails.errors).forEach((field) => {
              const fieldErrors = errorDetails.errors[field];
              const arabicFieldName = fieldNames[field] || field;
              if (Array.isArray(fieldErrors)) {
                fieldErrors.forEach((err: string) => {
                  validationErrors.push(`❌ ${arabicFieldName}: ${err}`);
                });
              }
            });
            if (validationErrors.length > 0) {
              errorMessage = validationErrors.join("\n");
            } else {
              errorMessage =
                errorDetails.title || errorDetails.message || errorMessage;
            }
          } else {
            errorMessage =
              errorDetails.title || errorDetails.message || errorMessage;
          }
        } else {
          const text = await response.text();
          console.log("Error response text:", text);
          errorMessage = text || errorMessage;
        }
      } catch (e) {
        console.error("Error reading error response:", e);
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("✅ Article updated successfully:", data);
    return data;
  } catch (error) {
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
          } catch (parseError) {
            console.error("JSON Parse Error:", parseError);
            errorMessage = text || `Bad Request (${response.status})`;
          }
        } else {
          errorMessage = text || `Bad Request (${response.status})`;
        }
      } catch (err) {
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
  } catch (error) {
    console.error("Error creating article:", error);
    throw error;
  }
};

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
  } catch (error) {
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
  } catch (error) {
    console.error("Error fetching categories:", error);
    // إرجاع مصفوفة فارغة بدلاً من إلقاء الخطأ
    return [];
  }
};
