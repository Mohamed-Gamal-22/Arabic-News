"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  const handleLogout = async () => {
    await signOut({
      callbackUrl: "/",
    });
  };

  return (
    <Button onClick={handleLogout} variant="outline" className="arabic-text">
      تسجيل الخروج
    </Button>
  );
}
