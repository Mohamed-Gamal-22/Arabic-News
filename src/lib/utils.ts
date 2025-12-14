import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * تحويل روابط الفيديو في HTML إلى فيديو مدمج (iframe)
 * يدعم: YouTube, Vimeo
 */
export function convertVideoLinksToEmbeds(html: string): string {
  if (!html) return html;

  // استخراج video ID من YouTube URL
  const extractYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  // استخراج video ID من Vimeo URL
  const extractVimeoId = (url: string): string | null => {
    const match = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
    return match ? match[1] : null;
  };

  // إنشاء embed HTML
  const createEmbed = (videoId: string, platform: 'youtube' | 'vimeo'): string => {
    if (platform === 'youtube') {
      return `<div class="video-responsive"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
    } else {
      return `<div class="video-responsive"><iframe src="https://player.vimeo.com/video/${videoId}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
    }
  };

  // 1. معالجة روابط الفيديو داخل <a> tags أولاً
  html = html.replace(
    /<a[^>]*href=["'](https?:\/\/(?:www\.)?[^"']*(?:youtube\.com|youtu\.be|vimeo\.com)[^"']*)["'][^>]*>([^<]*)<\/a>/gi,
    (match, url) => {
      // محاولة استخراج YouTube ID
      const youtubeId = extractYouTubeId(url);
      if (youtubeId) {
        return createEmbed(youtubeId, 'youtube');
      }

      // محاولة استخراج Vimeo ID
      const vimeoId = extractVimeoId(url);
      if (vimeoId) {
        return createEmbed(vimeoId, 'vimeo');
      }

      // إذا لم نتمكن من تحويله، نتركه كما هو
      return match;
    }
  );

  // 2. معالجة الروابط النصية (غير داخل <a> tags)
  // نتأكد من أن الرابط ليس داخل HTML tag
  html = html.replace(
    /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|vimeo\.com\/|player\.vimeo\.com\/video\/)[^\s<>"']+)/gi,
    (match, offset, string) => {
      // التحقق من أن الرابط ليس داخل HTML tag
      const beforeMatch = string.substring(Math.max(0, offset - 50), offset);
      if (beforeMatch.lastIndexOf('<') > beforeMatch.lastIndexOf('>')) {
        return match; // الرابط داخل tag، نتركه
      }

      // محاولة استخراج YouTube ID
      const youtubeId = extractYouTubeId(match);
      if (youtubeId) {
        return createEmbed(youtubeId, 'youtube');
      }

      // محاولة استخراج Vimeo ID
      const vimeoId = extractVimeoId(match);
      if (vimeoId) {
        return createEmbed(vimeoId, 'vimeo');
      }

      return match;
    }
  );

  return html;
}
