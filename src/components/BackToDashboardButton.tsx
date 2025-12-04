"use client";

import { useMemo, type ComponentProps } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BackToDashboardButtonProps = {
  label?: string;
  className?: string;
  variant?: ComponentProps<typeof Button>["variant"];
  size?: ComponentProps<typeof Button>["size"];
  fallbackPath?: string;
  useHistoryBack?: boolean;
};

const roleToDashboardPath: Record<string, string> = {
  SuperAdmin: "/dashboard/super-admin",
  Admin: "/dashboard/admin",
  User: "/dashboard/writer",
  Writer: "/dashboard/writer",
};

export default function BackToDashboardButton({
  label = "العودة للداشبورد",
  className,
  variant = "default",
  size = "sm",
  fallbackPath,
  useHistoryBack = true,
}: BackToDashboardButtonProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const targetPath = useMemo(() => {
    const role = session?.user?.role;
    if (!role) return "/dashboard";

    // بعض الصفحات قد تخزن الأدوار بأكثر من صيغة
    const normalizedRole = role.trim();
    return fallbackPath || roleToDashboardPath[normalizedRole] || "/dashboard";
  }, [fallbackPath, session?.user?.role]);

  const handleClick = () => {
    if (
      useHistoryBack &&
      typeof window !== "undefined" &&
      window.history.length > 1
    ) {
      window.history.back();
      return;
    }

    router.push(targetPath);
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn(
        "cursor-pointer bg-blue-600 hover:bg-blue-700 text-white",
        className
      )}
      onClick={handleClick}
    >
      {label}
    </Button>
  );
}
