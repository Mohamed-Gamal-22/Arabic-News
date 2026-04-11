"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useSession, signOut } from "next-auth/react";
import { ApiUser } from "@/lib/api";

interface UserContextType {
  userData: ApiUser | null;
  loading: boolean;
  error: string | null;
  refreshUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [userData, setUserData] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async () => {
    if (!session?.accessToken || !session?.user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // الحصول على userId من session - هذا هو الـ ID المستخدم في URL
      const userId = session.user?.id;
      if (!userId) {
        console.error("❌ User ID not found in session");
        console.error("Session user object:", session.user);
        setError(
          "لا يمكن الوصول إلى بيانات المستخدم. يرجى تسجيل الدخول مرة أخرى."
        );
        setLoading(false);
        return;
      }

      console.log("=== Fetching user data from UserContext ===");
      console.log("User ID from session (will be used in URL):", userId);
      console.log("Full session user:", session.user);
      console.log("Token available:", !!session.accessToken);

      // استخدام /api/users/{userId} endpoint مباشرة مع userId من session
      const userApiUrl = `https://newswebsite.runasp.net/api/users/${userId}`;
      console.log("Full API URL:", userApiUrl);

      const response = await fetch(userApiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Users/{id} endpoint response status:", response.status);
      console.log("Users/{id} endpoint response ok:", response.ok);

      if (!response.ok) {
        if (response.status === 401) {
          console.warn(
            "⚠️ User API returned 401 — token expired or invalid; clearing session."
          );
          setUserData(null);
          setError(null);
          setLoading(false);
          await signOut({ redirect: false });
          return;
        }
        if (response.status === 403) {
          console.warn(
            "⚠️ Endpoint returned 403 - user may not have permission"
          );

          // محاولة استخدام categories من session إذا كانت موجودة
          const sessionCategories = session.user?.categories;
          const sessionCategoryIds = session.user?.categoryIds;

          if (sessionCategories || sessionCategoryIds) {
            console.log("✅ Using categories from session as fallback");
            const fallbackUserData: ApiUser = {
              id: userId,
              email: session.user.email || "",
              userName: "",
              displayName: session.user.name || "",
              phoneNumber: null,
              nationalId: null,
              fullName: session.user.name || "",
              imageUrl: null,
              roles: [],
              categoryIds:
                (Array.isArray(sessionCategoryIds) ? sessionCategoryIds : []) ||
                (Array.isArray(sessionCategories)
                  ? sessionCategories.map((cat: { id: number }) => cat.id)
                  : []) ||
                [],
              categories:
                (Array.isArray(sessionCategories) ? sessionCategories : []) ||
                [],
            };
            setUserData(fallbackUserData);
            setError(null);
            setLoading(false);
            return;
          }

          // إذا لم توجد categories في session أيضاً، نرجع null بدون error
          console.warn("⚠️ No categories found in session either");
          setUserData(null);
          setError(
            "ليس لديك صلاحية للوصول إلى بيانات المستخدم أو لم يتم تعيين أقسام لك"
          );
          setLoading(false);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ User data received in context:", data);
      console.log("User categories:", data.categories);
      console.log("User categoryIds:", data.categoryIds);

      setUserData(data);
      setError(null);
    } catch (err: unknown) {
      console.error("❌ Error fetching user data:", err);
      setError(
        err instanceof Error ? err.message : "حدث خطأ في جلب بيانات المستخدم"
      );
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchUserData();
    } else {
      setUserData(null);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken, session?.user?.id]);

  return (
    <UserContext.Provider
      value={{
        userData,
        loading,
        error,
        refreshUserData: fetchUserData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
