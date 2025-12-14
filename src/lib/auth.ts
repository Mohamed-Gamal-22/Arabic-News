import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// دالة لاستخراج الصلاحيات من JWT token
function decodeJWT(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) {
      return null;
    }
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const parsed = JSON.parse(jsonPayload);
    return typeof parsed === "object" && parsed !== null
      ? (parsed as Record<string, unknown>)
      : null;
  } catch (error: unknown) {
    console.error("خطأ في فك تشفير JWT:", error);
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "البريد الإلكتروني", type: "email" },
        password: { label: "كلمة المرور", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const response = await fetch(
            "https://newswebsite.runasp.net/api/authentication/login",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                Email: credentials.email,
                Password: credentials.password,
              }),
            }
          );

          if (!response.ok) {
            console.error("خطأ في استجابة API:", response.status);
            return null;
          }

          const data = await response.json();
          console.log("=== Login Response Data ===");
          console.log("Full login response:", data);

          // التحقق من وجود البيانات المطلوبة
          if (!data.email || !data.displayName || !data.token) {
            console.error("بيانات غير مكتملة من API");
            return null;
          }

          // استخراج الصلاحيات من JWT token
          const decodedToken = decodeJWT(data.token);
          console.log("Decoded JWT from login:", decodedToken);
          
          // استخراج User ID من JWT token
          // قد يكون موجود في claims مختلفة
          const userId = 
            decodedToken?.sub || 
            decodedToken?.nameid ||
            decodedToken?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/nameidentifier"] ||
            decodedToken?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
            data.id || // في بعض الحالات قد يكون موجود في login response
            data.email; // fallback إلى email
            
          console.log("Extracted User ID from JWT:", userId);
          
          let role = "writer"; // افتراضي للكاتب العادي

          if (
            decodedToken &&
            decodedToken[
              "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
            ]
          ) {
            const apiRole =
              decodedToken[
                "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
              ];
            switch (apiRole) {
              case "SuperAdmin":
                role = "super_admin";
                break;
              case "Admin":
                role = "admin";
                break;
              default:
                role = "writer";
            }
          }

          // التحقق من وجود categories أو categoryIds في response
          console.log("Categories in login response:", data.categories);
          console.log("CategoryIds in login response:", data.categoryIds);
          console.log("User ID from login response data:", data.id);

          return {
            id: userId, // استخدام الـ ID المستخرج من JWT
            email: data.email,
            name: data.displayName,
            role: role,
            token: data.token,
            // حفظ categories إذا كانت موجودة في response
            ...(data.categories && { categories: data.categories }),
            ...(data.categoryIds && { categoryIds: data.categoryIds }),
          };
        } catch (error: unknown) {
          console.error("خطأ في المصادقة:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // عند تسجيل الدخول الأول
      if (user) {
        console.log("=== JWT Callback - First Login ===");
        console.log("User ID:", user.id);
        console.log("User Email:", user.email);
        console.log("User Role:", user.role);
        console.log(
          "User Token:",
          user.token ? `${user.token.substring(0, 30)}...` : "MISSING TOKEN!"
        );

        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.token;
        
        // حفظ categories و categoryIds إذا كانت موجودة
        if (user.categories) {
          token.categories = user.categories;
        }
        if (user.categoryIds) {
          token.categoryIds = user.categoryIds;
        }

        console.log("Token set successfully:", {
          hasAccessToken: !!token.accessToken,
          tokenLength: token.accessToken?.length,
          hasCategories: !!token.categories,
          hasCategoryIds: !!token.categoryIds,
        });
      } else {
        console.log("=== JWT Callback - Subsequent Request ===");
        console.log("Token ID:", token.id);
        console.log("Token Role:", token.role);
        console.log("Has AccessToken:", !!token.accessToken);
        console.log("Token Categories:", token.categories);
        console.log("Token CategoryIds:", token.categoryIds);
      }

      return token;
    },
    async session({ session, token }) {
      console.log("=== Session Callback ===");
      console.log("Token ID:", token.id);
      console.log("Token Role:", token.role);
      console.log("Has AccessToken:", !!token.accessToken);
      console.log("AccessToken length:", token.accessToken?.length);
          console.log("Token Categories:", token.categories);
          console.log("Token CategoryIds:", token.categoryIds);

      if (token && token.accessToken) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.accessToken = token.accessToken as string;
        
        // حفظ categories و categoryIds في session إذا كانت موجودة
        if (token.categories) {
          session.user.categories = token.categories;
        }
        if (token.categoryIds) {
          session.user.categoryIds = token.categoryIds;
        }
        
        console.log("✅ Session successfully configured");
        console.log("Session Categories:", session.user.categories);
        console.log("Session CategoryIds:", session.user.categoryIds);
      } else {
        console.error("❌ Session missing accessToken!");
        console.log("Full token object:", JSON.stringify(token, null, 2));
      }

      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 ساعة
  },
  secret: process.env.NEXTAUTH_SECRET,
};
