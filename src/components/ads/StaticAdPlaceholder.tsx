import { cn } from "@/lib/utils";

export type StaticAdVariant =
  | "banner"
  | "medium"
  | "homeBanner"
  | "homeStack1"
  | "homeStack2"
  | "homeStack3"
  | "homeStack4";

/** مسارات الملفات في `public/ads` — استبدل الصور واحتفظ بنفس الأسماء أو عدّل CONFIG أدناه */
export const STATIC_AD_PATHS: Record<StaticAdVariant, string> = {
  banner: "/ads/banner-728x90.svg",
  medium: "/ads/medium-300x250.svg",
  homeBanner: "/ads/home-banner.svg",
  homeStack1: "/ads/home-stack-1.svg",
  homeStack2: "/ads/home-stack-2.svg",
  homeStack3: "/ads/home-stack-3.svg",
  homeStack4: "/ads/home-stack-4.svg",
};

const CONFIG: Record<
  StaticAdVariant,
  { src: string; w: number; h: number }
> = {
  banner: { src: STATIC_AD_PATHS.banner, w: 728, h: 90 },
  medium: { src: STATIC_AD_PATHS.medium, w: 300, h: 250 },
  homeBanner: { src: STATIC_AD_PATHS.homeBanner, w: 728, h: 90 },
  homeStack1: { src: STATIC_AD_PATHS.homeStack1, w: 300, h: 250 },
  homeStack2: { src: STATIC_AD_PATHS.homeStack2, w: 300, h: 250 },
  homeStack3: { src: STATIC_AD_PATHS.homeStack3, w: 300, h: 250 },
  homeStack4: { src: STATIC_AD_PATHS.homeStack4, w: 300, h: 250 },
};

/**
 * صور إعلانات ثابتة من `public/ads` — ألوان مميزة للمعاينة؛ استبدل الملفات عند الجاهزية.
 */
export function StaticAdPlaceholder({
  variant,
  className,
}: {
  variant: StaticAdVariant;
  className?: string;
}) {
  const { src, w, h } = CONFIG[variant];
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border-2 border-gray-300 shadow-md ring-2 ring-gray-200/80 dark:border-gray-500 dark:ring-gray-600/50",
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        width={w}
        height={h}
        className="h-auto w-full max-w-full object-contain"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
