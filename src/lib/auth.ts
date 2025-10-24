import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// دالة لاستخراج الصلاحيات من JWT token
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
  } catch (error) {
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

          // التحقق من وجود البيانات المطلوبة
          if (!data.email || !data.displayName || !data.token) {
            console.error("بيانات غير مكتملة من API");
            return null;
          }

          // استخراج الصلاحيات من JWT token
          const decodedToken = decodeJWT(data.token);
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

          return {
            id: decodedToken?.sub || data.email,
            email: data.email,
            name: data.displayName,
            role: role,
            token: data.token,
          };
        } catch (error) {
          console.error("خطأ في المصادقة:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.accessToken = user.token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.accessToken = token.accessToken as string;
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
