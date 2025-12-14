// دالة لجلب المستخدمين من API
export const getUsers = async (token: string) => {
  try {
    const response = await fetch("https://newswebsite.runasp.net/api/users", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: unknown) {
    console.error("خطأ في جلب المستخدمين:", error);
    throw error;
  }
};

// Types for user operations
export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: string;
  categoryIds?: number[];
}

export interface UpdateUserData {
  id?: string;
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  categoryIds?: number[];
}

export interface CategoryData {
  name: string;
  slug: string;
  description?: string | null;
  parentId?: number | null;
}

// دالة لإنشاء مستخدم جديد
export const createUser = async (token: string, userData: CreateUserData) => {
  try {
    const response = await fetch("https://newswebsite.runasp.net/api/users", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error: unknown) {
    console.error("خطأ في إنشاء المستخدم:", error);
    throw error;
  }
};

// دالة لجلب مستخدم واحد بالـ ID
export const getUserById = async (token: string, userId: string) => {
  try {
    const response = await fetch(
      `https://newswebsite.runasp.net/api/users/${userId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: unknown) {
    console.error("خطأ في جلب المستخدم:", error);
    throw error;
  }
};

// دالة لتحديث مستخدم
export const updateUser = async (token: string, userData: UpdateUserData) => {
  try {
    const response = await fetch(
      "https://newswebsite.runasp.net/api/users/update-user",
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    // إذا كان الاستجابة فارغة (204 No Content) أو ناجحة
    if (response.status === 204 || response.status === 200) {
      return { success: true, message: "تم تحديث المستخدم بنجاح" };
    }

    const data = await response.json();
    return data;
  } catch (error: unknown) {
    console.error("خطأ في تحديث المستخدم:", error);
    throw error;
  }
};

// دالة لتحديث أدوار المستخدم
export const updateUserRoles = async (
  token: string,
  userId: string,
  role: string
) => {
  try {
    const response = await fetch(
      "https://newswebsite.runasp.net/api/users/update-roles",
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          UserId: userId,
          Roles: [role], // إرسال الدور كـ array مع دور واحد فقط
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    // إذا كان الاستجابة فارغة (204 No Content) أو ناجحة
    if (response.status === 204 || response.status === 200) {
      return { success: true, message: "تم تحديث أدوار المستخدم بنجاح" };
    }

    const data = await response.json();
    return data;
  } catch (error: unknown) {
    console.error("خطأ في تحديث أدوار المستخدم:", error);
    throw error;
  }
};

// دالة لحذف مستخدم
export const deleteUser = async (token: string, userId: string) => {
  try {
    const response = await fetch(
      `https://newswebsite.runasp.net/api/users/${userId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    // إذا كان الاستجابة فارغة (204 No Content)
    if (response.status === 204) {
      return { success: true, message: "تم حذف المستخدم بنجاح" };
    }

    const data = await response.json();
    return data;
  } catch (error: unknown) {
    console.error("خطأ في حذف المستخدم:", error);
    throw error;
  }
};

// دالة لفك تشفير JWT token
function decodeJWT(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error: unknown) {
    console.error("خطأ في فك تشفير JWT:", error);
    return null;
  }
}

// دالة لجلب بيانات المستخدم الحالي
export const getCurrentUser = async (
  token: string,
  email?: string,
  userId?: string
) => {
  try {
    console.log("=== getCurrentUser called ===");
    console.log("Email:", email);
    console.log("UserId:", userId);
    console.log("Token available:", !!token);

    // محاولة 1: استخدام endpoint محدد للمستخدم الحالي
    try {
      const response = await fetch(
        "https://newswebsite.runasp.net/api/users/profile",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Profile endpoint response status:", response.status);
      console.log("Profile endpoint response ok:", response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Profile endpoint data received:", data);
        console.log("CategoryIds found:", data.categoryIds);
        console.log("Categories found:", data.categories);

        // إذا كانت categoryIds موجودة وغير فارغة، نرجع البيانات
        if (data.categoryIds && data.categoryIds.length > 0) {
          return data;
        }

        // إذا كانت categoryIds فارغة لكن categories موجودة، نستخرج ids من categories
        if (
          data.categories &&
          Array.isArray(data.categories) &&
          data.categories.length > 0
        ) {
          console.log("✅ Extracting categoryIds from categories array");
          const extractedCategoryIds = data.categories.map(
            (cat: { id: number }) => cat.id
          );
          console.log("Extracted categoryIds:", extractedCategoryIds);
          return {
            ...data,
            categoryIds: extractedCategoryIds,
          };
        }

        // إذا كان كلاهما فارغ، نرجع البيانات كما هي (لكن بدون categoryIds)
        return data;
      }

      // قراءة رسالة الخطأ إذا كانت متوفرة
      if (!response.ok) {
        try {
          const errorText = await response.text();
          console.log("Profile endpoint error response:", errorText);
          if (errorText) {
            try {
              const errorData = JSON.parse(errorText);
              console.log("Profile endpoint error JSON:", errorData);
            } catch {
              // ليس JSON
            }
          }
        } catch {
          console.log("Could not read error response");
        }
      }

      // إذا كان الخطأ 403 أو 401، نجرب طرق أخرى
      if (response.status === 403 || response.status === 401) {
        console.warn("⚠️ /users/profile endpoint returned", response.status);
      }
    } catch (profileError: unknown) {
      console.error("❌ Profile endpoint error:", profileError);
      console.error("Error message:", profileError.message);
    }

    // محاولة 2: فك تشفير JWT token للحصول على بيانات المستخدم
    try {
      const decodedToken = decodeJWT(token);
      console.log("Decoded JWT token:", decodedToken);

      if (decodedToken) {
        // البحث عن categoryIds في JWT token
        // قد تكون موجودة في claims مختلفة
        const categoryIdsClaim =
          decodedToken["categoryIds"] ||
          decodedToken["CategoryIds"] ||
          decodedToken[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/categoryIds"
          ];

        const userIdClaim =
          decodedToken["sub"] ||
          decodedToken["nameid"] ||
          decodedToken[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/nameidentifier"
          ];

        console.log("CategoryIds from JWT:", categoryIdsClaim);
        console.log("UserId from JWT:", userIdClaim);

        // إذا وجدنا categoryIds في JWT
        if (
          categoryIdsClaim &&
          Array.isArray(categoryIdsClaim) &&
          categoryIdsClaim.length > 0
        ) {
          console.log("✅ Found categoryIds in JWT token");
          return {
            id: userIdClaim || email,
            email:
              email ||
              decodedToken["email"] ||
              decodedToken[
                "http://schemas.microsoft.com/ws/2008/06/identity/claims/emailaddress"
              ],
            categoryIds: categoryIdsClaim,
          };
        }

        // محاولة 3: استخدام userId من parameter أو JWT للحصول على بيانات المستخدم
        const targetUserId = userId || userIdClaim;
        if (targetUserId) {
          console.log("Trying to fetch user by ID:", targetUserId);
          try {
            const userResponse = await fetch(
              `https://newswebsite.runasp.net/api/users/${targetUserId}`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );

            console.log("User by ID response status:", userResponse.status);
            console.log("User by ID response ok:", userResponse.ok);

            if (userResponse.ok) {
              const userData = await userResponse.json();
              console.log("✅ User data fetched by ID:", userData);

              // إذا كانت categoryIds موجودة وغير فارغة، نرجع البيانات
              if (userData.categoryIds && userData.categoryIds.length > 0) {
                return userData;
              }

              // إذا كانت categoryIds فارغة لكن categories موجودة، نستخرج ids من categories
              if (
                userData.categories &&
                Array.isArray(userData.categories) &&
                userData.categories.length > 0
              ) {
                console.log(
                  "✅ Extracting categoryIds from categories array (by ID)"
                );
                const extractedCategoryIds = userData.categories.map(
                  (cat: { id: number }) => cat.id
                );
                console.log("Extracted categoryIds:", extractedCategoryIds);
                return {
                  ...userData,
                  categoryIds: extractedCategoryIds,
                };
              }

              // إذا كان كلاهما فارغ، نرجع البيانات كما هي
              return userData;
            } else {
              console.warn(
                "Could not fetch user by ID, status:",
                userResponse.status
              );
            }
          } catch (userError: unknown) {
            console.error("Error fetching user by ID:", userError);
          }
        }
      }
    } catch (jwtError: unknown) {
      console.error("Error decoding JWT:", jwtError);
    }

    // محاولة 4: محاولة جلب بيانات المستخدم باستخدام endpoint مختلف
    // محاولة استخدام /users endpoint مع filter (قد لا يعمل للكاتب)
    if (email) {
      console.log(
        "Trying alternative method: fetching all users (may not work for writer)"
      );
      try {
        // محاولة جلب جميع المستخدمين ثم البحث عن المستخدم الحالي بالبريد
        // ملاحظة: هذا قد لا يعمل للكاتب (403)
        const usersResponse = await fetch(
          "https://newswebsite.runasp.net/api/users",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (usersResponse.ok) {
          const users = await usersResponse.json();
          console.log("✅ Fetched all users, searching for current user");

          if (Array.isArray(users)) {
            const currentUser = users.find(
              (u: { email: string }) => u.email === email
            );
            if (currentUser) {
              console.log("✅ Found current user in users list:", currentUser);

              // إذا كانت categoryIds موجودة وغير فارغة، نرجع البيانات
              if (
                currentUser.categoryIds &&
                currentUser.categoryIds.length > 0
              ) {
                return currentUser;
              }

              // إذا كانت categoryIds فارغة لكن categories موجودة، نستخرج ids
              if (
                currentUser.categories &&
                Array.isArray(currentUser.categories) &&
                currentUser.categories.length > 0
              ) {
                console.log(
                  "✅ Extracting categoryIds from categories array (users list)"
                );
                const extractedCategoryIds = currentUser.categories.map(
                  (cat: { id: number }) => cat.id
                );
                return {
                  ...currentUser,
                  categoryIds: extractedCategoryIds,
                };
              }

              return currentUser;
            }
          }
        } else {
          console.warn(
            "Could not fetch users list, status:",
            usersResponse.status
          );
        }
      } catch (usersError: unknown) {
        console.error("Error fetching users list:", usersError);
      }
    }

    console.warn("⚠️ Could not fetch user data from any source");
    console.warn(
      "All endpoints returned 403 or failed. User may not have permission to access user data."
    );
    return null;
  } catch (error: unknown) {
    console.error("❌ خطأ في جلب بيانات المستخدم الحالي:", error);
    return null;
  }
};

// دالة لجلب الكاتيجوريز مع التوكن
export const getCategoriesWithToken = async (token: string) => {
  try {
    console.log("=== Fetching all categories ===");
    const response = await fetch(
      "https://newswebsite.runasp.net/api/category",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Categories response status:", response.status);
    console.log("Categories response ok:", response.ok);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ All categories fetched:", data);
    console.log(
      "Total categories count:",
      Array.isArray(data) ? data.length : "Not an array"
    );
    return data;
  } catch (error: unknown) {
    console.error("❌ خطأ في جلب الكاتيجوريز:", error);
    throw error;
  }
};

// دالة لجلب كاتيجوري بالـ ID
export const getCategoryById = async (token: string, categoryId: number) => {
  try {
    const response = await fetch(
      `https://newswebsite.runasp.net/api/category/${categoryId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: unknown) {
    console.error("خطأ في جلب الكاتيجوري:", error);
    throw error;
  }
};

// دالة لتحديث كاتيجوري
export const updateCategory = async (
  token: string,
  categoryId: number,
  categoryData: CategoryData
) => {
  try {
    console.log("Updating category data:", categoryData);

    const response = await fetch(
      `https://newswebsite.runasp.net/api/category/${categoryId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryData),
      }
    );

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error data:", errorData);
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    // التحقق من وجود محتوى في الـ response
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      try {
        const data = await response.json();
        return data;
      } catch {
        console.log("Response is not valid JSON, treating as success");
        return { success: true, message: "تم التحديث بنجاح" };
      }
    } else {
      // إذا لم يكن JSON، نرجع رسالة نجاح
      return { success: true, message: "تم التحديث بنجاح" };
    }
  } catch (error: unknown) {
    console.error("خطأ في تحديث الكاتيجوري:", error);
    throw error;
  }
};

// دالة لحذف كاتيجوري
export const deleteCategory = async (token: string, categoryId: number) => {
  try {
    console.log("Deleting category with ID:", categoryId);

    const response = await fetch(
      `https://newswebsite.runasp.net/api/category/${categoryId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error data:", errorData);
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    // التحقق من وجود محتوى في الـ response
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      try {
        const data = await response.json();
        return data;
      } catch {
        console.log("Response is not valid JSON, treating as success");
        return { success: true, message: "تم الحذف بنجاح" };
      }
    } else {
      // إذا لم يكن JSON، نرجع رسالة نجاح
      return { success: true, message: "تم الحذف بنجاح" };
    }
  } catch (error: unknown) {
    console.error("خطأ في حذف الكاتيجوري:", error);
    throw error;
  }
};

// دالة لإنشاء كاتيجوري جديد
export const createCategory = async (
  token: string,
  categoryData: CategoryData
) => {
  try {
    console.log("Sending category data:", categoryData);

    const response = await fetch(
      "https://newswebsite.runasp.net/api/category",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryData),
      }
    );

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error data:", errorData);
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error: unknown) {
    console.error("خطأ في إنشاء الكاتيجوري:", error);
    throw error;
  }
};
