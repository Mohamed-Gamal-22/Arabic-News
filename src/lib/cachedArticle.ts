import { cache } from "react";
import { getArticleBySlug } from "@/lib/api";

/** جلب مقال بالـ slug مرة واحدة لكل طلب (مشاركة بين generateMetadata والصفحة). */
export const getCachedArticleBySlug = cache(async (slug: string) => {
  return getArticleBySlug(slug);
});
