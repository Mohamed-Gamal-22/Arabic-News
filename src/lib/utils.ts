import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * استخراج معرف فيديو YouTube من رابط
 */
function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * استخراج معرف فيديو Facebook من رابط
 */
function extractFacebookVideoId(url: string): string | null {
  // Facebook video URLs formats:
  // https://www.facebook.com/watch/?v=VIDEO_ID
  // https://www.facebook.com/USERNAME/videos/VIDEO_ID
  // https://fb.watch/VIDEO_ID
  const patterns = [
    /facebook\.com\/watch\/\?v=([^&\n?#]+)/,
    /facebook\.com\/[^\/]+\/videos\/(\d+)/,
    /fb\.watch\/([^&\n?#\/]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * استخراج معرف فيديو Vimeo من رابط
 */
function extractVimeoVideoId(url: string): string | null {
  // Vimeo URLs: https://vimeo.com/VIDEO_ID
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * استخراج معرف فيديو Dailymotion من رابط
 */
function extractDailymotionVideoId(url: string): string | null {
  // Dailymotion URLs: https://www.dailymotion.com/video/VIDEO_ID
  const match = url.match(/dailymotion\.com\/video\/([^&\n?#\/]+)/);
  return match ? match[1] : null;
}

/**
 * تحويل روابط الفيديو في HTML إلى فيديو مدمج (iframe)
 * يدعم: YouTube, Facebook, Vimeo, Dailymotion
 */
export function convertVideoLinksToEmbeds(html: string): string {
  if (!html) return html;

  let processedHtml = html;
  const embeds: string[] = [];
  const MARKER_PREFIX = "__VIDEO_EMBED_";
  const MARKER_SUFFIX = "__";

  // Helper function لإنشاء embed marker
  const createEmbedMarker = (embedHtml: string): string => {
    const index = embeds.length;
    embeds.push(embedHtml);
    return `${MARKER_PREFIX}${index}${MARKER_SUFFIX}`;
  };

  // Helper function لاستبدال markers بـ embeds
  const replaceMarkers = (html: string): string => {
    embeds.forEach((embed, index) => {
      html = html.replace(`${MARKER_PREFIX}${index}${MARKER_SUFFIX}`, embed);
    });
    return html;
  };

  // 1. معالجة YouTube links داخل <a> tags أولاً
  processedHtml = processedHtml.replace(
    /<a[^>]*href=["'](https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^"'\s&?#]+))["'][^>]*>([^<]*)<\/a>/gi,
    (match, fullUrl, videoId) => {
      if (videoId && videoId.length >= 11) {
        const embedHtml = `<div class="video-embed-container my-6" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; background: #000; border-radius: 12px;">
          <iframe 
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
            src="https://www.youtube.com/embed/${videoId}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
            loading="lazy"
          ></iframe>
        </div>`;
        return createEmbedMarker(embedHtml);
      }
      return match;
    }
  );

  // 2. معالجة YouTube plain links - فقط خارج HTML tags
  processedHtml = processedHtml.replace(
    /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})[^\s<>"']*)/gi,
    (match, fullUrl, videoId, offset, string) => {
      // تحقق أن الرابط ليس داخل HTML tag
      const beforeMatch = string.substring(Math.max(0, offset - 50), offset);
      const afterMatch = string.substring(
        offset + match.length,
        offset + match.length + 10
      );

      // إذا كان الرابط داخل tag (قبل < وليس بعد >)، تجاهله
      if (beforeMatch.lastIndexOf("<") > beforeMatch.lastIndexOf(">")) {
        return match;
      }

      if (videoId && videoId.length === 11) {
        const embedHtml = `<div class="video-embed-container my-6" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; background: #000; border-radius: 12px;">
          <iframe 
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
            src="https://www.youtube.com/embed/${videoId}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
            loading="lazy"
          ></iframe>
        </div>`;
        return createEmbedMarker(embedHtml);
      }
      return match;
    }
  );

  // 3. Facebook links داخل <a> tags
  processedHtml = processedHtml.replace(
    /<a[^>]*href=["'](https?:\/\/(?:www\.)?(?:facebook\.com\/watch\/\?v=|facebook\.com\/[^\/]+\/videos\/|fb\.watch\/)[^"']+)["'][^>]*>([^<]*)<\/a>/gi,
    (match, fullUrl) => {
      const videoId = extractFacebookVideoId(fullUrl);
      if (videoId) {
        const embedHtml = `<div class="video-embed-container my-6" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; background: #000; border-radius: 12px;">
          <iframe 
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
            src="https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
              fullUrl
            )}&show_text=0&width=560" 
            frameborder="0" 
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture" 
            allowfullscreen
            loading="lazy"
          ></iframe>
        </div>`;
        return createEmbedMarker(embedHtml);
      }
      return match;
    }
  );

  // 4. Facebook plain links
  processedHtml = processedHtml.replace(
    /(https?:\/\/(?:www\.)?(?:facebook\.com\/watch\/\?v=|facebook\.com\/[^\/]+\/videos\/|fb\.watch\/)[^\s<>"]+)/gi,
    (match, ...args) => {
      const offset = args[args.length - 2];
      const string = args[args.length - 1];
      const beforeMatch = string.substring(Math.max(0, offset - 50), offset);
      if (beforeMatch.lastIndexOf("<") > beforeMatch.lastIndexOf(">")) {
        return match;
      }
      const videoId = extractFacebookVideoId(match);
      if (videoId) {
        const embedHtml = `<div class="video-embed-container my-6" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; background: #000; border-radius: 12px;">
          <iframe 
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
            src="https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
              match
            )}&show_text=0&width=560" 
            frameborder="0" 
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture" 
            allowfullscreen
            loading="lazy"
          ></iframe>
        </div>`;
        return createEmbedMarker(embedHtml);
      }
      return match;
    }
  );

  // 5. Vimeo links داخل <a> tags
  processedHtml = processedHtml.replace(
    /<a[^>]*href=["'](https?:\/\/vimeo\.com\/(\d+)[^"']*)["'][^>]*>([^<]*)<\/a>/gi,
    (match, fullUrl, videoId) => {
      if (videoId) {
        const embedHtml = `<div class="video-embed-container my-6" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; background: #000; border-radius: 12px;">
          <iframe 
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
            src="https://player.vimeo.com/video/${videoId}" 
            frameborder="0" 
            allow="autoplay; fullscreen; picture-in-picture" 
            allowfullscreen
            loading="lazy"
          ></iframe>
        </div>`;
        return createEmbedMarker(embedHtml);
      }
      return match;
    }
  );

  // 6. Vimeo plain links
  processedHtml = processedHtml.replace(
    /(https?:\/\/vimeo\.com\/(\d+)[^\s<>"]*)/gi,
    (match, fullUrl, videoId, offset, string) => {
      const beforeMatch = string.substring(Math.max(0, offset - 50), offset);
      if (beforeMatch.lastIndexOf("<") > beforeMatch.lastIndexOf(">")) {
        return match;
      }
      if (videoId) {
        const embedHtml = `<div class="video-embed-container my-6" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; background: #000; border-radius: 12px;">
          <iframe 
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
            src="https://player.vimeo.com/video/${videoId}" 
            frameborder="0" 
            allow="autoplay; fullscreen; picture-in-picture" 
            allowfullscreen
            loading="lazy"
          ></iframe>
        </div>`;
        return createEmbedMarker(embedHtml);
      }
      return match;
    }
  );

  // 7. Dailymotion links داخل <a> tags
  processedHtml = processedHtml.replace(
    /<a[^>]*href=["'](https?:\/\/(?:www\.)?dailymotion\.com\/video\/([^"'\s&?#\/]+))["'][^>]*>([^<]*)<\/a>/gi,
    (match, fullUrl, videoId) => {
      if (videoId) {
        const embedHtml = `<div class="video-embed-container my-6" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; background: #000; border-radius: 12px;">
          <iframe 
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
            src="https://www.dailymotion.com/embed/video/${videoId}" 
            frameborder="0" 
            allow="autoplay; fullscreen" 
            allowfullscreen
            loading="lazy"
          ></iframe>
        </div>`;
        return createEmbedMarker(embedHtml);
      }
      return match;
    }
  );

  // 8. Dailymotion plain links
  processedHtml = processedHtml.replace(
    /(https?:\/\/(?:www\.)?dailymotion\.com\/video\/([^\s<>"&?#\/]+))/gi,
    (match, fullUrl, videoId, offset, string) => {
      const beforeMatch = string.substring(Math.max(0, offset - 50), offset);
      if (beforeMatch.lastIndexOf("<") > beforeMatch.lastIndexOf(">")) {
        return match;
      }
      if (videoId) {
        const embedHtml = `<div class="video-embed-container my-6" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; background: #000; border-radius: 12px;">
          <iframe 
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
            src="https://www.dailymotion.com/embed/video/${videoId}" 
            frameborder="0" 
            allow="autoplay; fullscreen" 
            allowfullscreen
            loading="lazy"
          ></iframe>
        </div>`;
        return createEmbedMarker(embedHtml);
      }
      return match;
    }
  );

  // استبدال جميع markers بـ embeds الفعلية
  return replaceMarkers(processedHtml);
}
