import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|m\.youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

function extractVimeoId(url: string): string | null {
  const match = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
  return match ? match[1] : null;
}

/** معرف منشور تويتر / X من الرابط (…/status/123…) */
function extractTwitterTweetId(url: string): string | null {
  const m = url.match(/\/status\/(\d+)/);
  return m?.[1] ?? null;
}

function createYouTubeEmbed(videoId: string): string {
  return `<div class="video-responsive"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
}

function createVimeoEmbed(videoId: string): string {
  return `<div class="video-responsive"><iframe src="https://player.vimeo.com/video/${videoId}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
}

function createTwitterEmbed(tweetId: string): string {
  const src = `https://platform.twitter.com/embed/Tweet.html?id=${encodeURIComponent(tweetId)}`;
  return `<div class="video-responsive video-responsive--tweet"><iframe src="${src}" frameborder="0" allowfullscreen loading="lazy" title="منشور تويتر"></iframe></div>`;
}

/** فك كيانات HTML في href كما يفعل المتصفح */
function decodeHtmlEntitiesInUrl(url: string): string {
  return url
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

/** نص ظاهر من محتوى داخل <a> قد يحتوي <strong> وغيره */
function innerHtmlToPlainLabel(inner: string): string {
  return inner
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** رابط https يُعتبر صورة قابلة للعرض في <img src> */
function isDirectImageFileUrl(url: string): boolean {
  const raw = decodeHtmlEntitiesInUrl(url).trim();
  if (!/^https?:\/\//i.test(raw)) return false;

  const pathOnly = raw.split(/[?#]/)[0] ?? "";
  if (/\.(jpe?g|png|gif|webp|svg|bmp|ico)(\/)?$/i.test(pathOnly)) return true;

  if (/[?&](fm|format|type)=(jpe?g|png|gif|webp)/i.test(raw)) return true;

  if (
    /[?&]w=\d+/i.test(raw) &&
    /[?&]h=\d+/i.test(raw) &&
    /googleusercontent|ggpht|gstatic/i.test(raw)
  )
    return true;

  if (
    /^https?:\/\/i\.imgur\.com\/[a-zA-Z0-9]{4,}(\.[a-z0-9]{2,5})?(\?|$|#)/i.test(
      raw
    )
  )
    return true;
  if (/pbs\.twimg\.com\/media\//i.test(raw)) return true;
  if (/images\.unsplash\.com|unsplash\.com\/photos\//i.test(raw)) return true;
  if (/picsum\.photos\/\d/i.test(raw)) return true;

  return false;
}

function escapeHtmlAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function anchorImageLinkToFigure(url: string, linkLabel: string): string {
  const decoded = decodeHtmlEntitiesInUrl(url);
  const alt = linkLabel.trim() || "صورة";
  const safeSrc = escapeHtmlAttr(decoded);
  const safeAlt = escapeHtmlAttr(alt);
  return `<p class="article-inline-image-wrap"><img src="${safeSrc}" alt="${safeAlt}" class="article-content-inline-img" loading="lazy" decoding="async" /></p>`;
}

/** يضيف target و rel للروابط الخارجية إن لم تكن موجودة */
function ensureExternalLinkAttrs(html: string): string {
  return html.replace(
    /<a(\s+[^>]*\bhref=["']https?:\/\/[^"']+["'][^>]*)>/gi,
    (full, attrs) => {
      if (/\starget\s*=/i.test(attrs)) return full;
      return `<a${attrs} target="_blank" rel="noopener noreferrer">`;
    }
  );
}

/**
 * تحويل روابط الوسائط في HTML إلى تضمين (iframe) مع الإبقاء على أي رابط عادي كما هو.
 * يدعم: YouTube، Vimeo، منشورات تويتر / X (رابط عادي أو داخل &lt;a&gt;).
 * روابط غير ذلك تبقى &lt;a&gt; عادية (مع target للروابط الخارجية عند الحاجة).
 */
export function convertVideoLinksToEmbeds(html: string): string {
  if (!html) return html;

  // 0) iframe تويتر مُلصق كنص HTML (قبل تحويل الروابط)
  html = html.replace(
    /<iframe[^>]*\bsrc=["']https?:\/\/platform\.twitter\.com\/embed\/Tweet\.html[^"']*["'][^>]*>\s*<\/iframe>/gi,
    (match, offset, full) => {
      const before = full.slice(Math.max(0, offset - 250), offset);
      if (before.includes("video-responsive--tweet")) return match;
      return `<div class="video-responsive video-responsive--tweet">${match}</div>`;
    }
  );

  // 1) روابط داخل <a href="..."> — يدعم محتوى متداخل (<strong>…)؛ صورة ثم فيديو
  html = html.replace(
    /<a\s+[^>]*\bhref=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
    (match, url: string, inner: string) => {
      const label = innerHtmlToPlainLabel(inner);

      if (
        isDirectImageFileUrl(url) &&
        !extractYouTubeId(url) &&
        !extractVimeoId(url) &&
        !extractTwitterTweetId(url)
      ) {
        return anchorImageLinkToFigure(url, label);
      }

      const youtubeId = extractYouTubeId(url);
      if (youtubeId) return createYouTubeEmbed(youtubeId);

      const vimeoId = extractVimeoId(url);
      if (vimeoId) return createVimeoEmbed(vimeoId);

      const tweetId = extractTwitterTweetId(url);
      if (tweetId) return createTwitterEmbed(tweetId);

      return match;
    }
  );

  // 2) عناوين URL كنص ظاهر (ليست داخل &lt;a&gt; بعد التحويل أعلاه)
  const embeddablePlainUrl =
    /(https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/watch\?v=[^&\s<>"']+|youtu\.be\/[a-zA-Z0-9_-]{11}[^?\s<>"']*|youtube\.com\/embed\/[^\s<>"']*|vimeo\.com\/\d+[^\s<>"']*|player\.vimeo\.com\/video\/\d+[^\s<>"']*|(?:twitter\.com|x\.com|mobile\.twitter\.com)\/[^/\s<>"']+\/status\/\d+[^\s<>"']*))/gi;

  html = html.replace(
    embeddablePlainUrl,
    (match: string, _g1: string, offset: number, full: string) => {
      const beforeMatch = full.substring(Math.max(0, offset - 80), offset);
      if (beforeMatch.lastIndexOf("<") > beforeMatch.lastIndexOf(">")) {
        return match;
      }

      const youtubeId = extractYouTubeId(match);
      if (youtubeId) return createYouTubeEmbed(youtubeId);

      const vimeoId = extractVimeoId(match);
      if (vimeoId) return createVimeoEmbed(vimeoId);

      const tweetId = extractTwitterTweetId(match);
      if (tweetId) return createTwitterEmbed(tweetId);

      if (
        isDirectImageFileUrl(match) &&
        !extractYouTubeId(match) &&
        !extractVimeoId(match) &&
        !extractTwitterTweetId(match)
      ) {
        return anchorImageLinkToFigure(match, "");
      }

      return match;
    }
  );

  html = ensureExternalLinkAttrs(html);

  return html;
}
