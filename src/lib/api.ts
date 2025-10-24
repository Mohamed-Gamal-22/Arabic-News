// إعدادات الـ API
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "https://newswebsite.runasp.net",
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
  CATEGORIES: "/api/category",
  SUBCATEGORIES: "/subcategories",

  // الأخبار التريندينج
  TRENDING_ARTICLES: "/articles/trending",

  // الإحصائيات
  DASHBOARD_STATS: "/dashboard/stats",
  WRITER_STATS: "/dashboard/writer-stats",
  ADMIN_STATS: "/dashboard/admin-stats",
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

// دالة لجلب التصنيفات
export const getCategories = async (): Promise<Category[]> => {
  try {
    const url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.CATEGORIES}`;
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
