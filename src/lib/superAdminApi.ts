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
  } catch (error) {
    console.error("خطأ في جلب المستخدمين:", error);
    throw error;
  }
};

// دالة لإنشاء مستخدم جديد
export const createUser = async (token: string, userData: any) => {
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
  } catch (error) {
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
  } catch (error) {
    console.error("خطأ في جلب المستخدم:", error);
    throw error;
  }
};

// دالة لتحديث مستخدم
export const updateUser = async (token: string, userData: any) => {
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
  } catch (error) {
    console.error("خطأ في تحديث المستخدم:", error);
    throw error;
  }
};
// دالة لتحديث أدوار المستخدم
export const updateUserRoles = async (
  token: string,
  userId: string,
  roles: string[]
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
          Roles: roles,
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
  } catch (error) {
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
  } catch (error) {
    console.error("خطأ في حذف المستخدم:", error);
    throw error;
  }
};
