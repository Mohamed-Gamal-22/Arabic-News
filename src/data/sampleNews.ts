export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  category: string;
  publishDate: string;
  readTime: string;
  slug: string;
  content?: string;
}

export const sampleNews: NewsArticle[] = [
  {
    id: "1",
    title: "تطورات جديدة في الأزمة السياسية في المنطقة العربية",
    summary:
      "شهدت المنطقة العربية تطورات مهمة في الأزمة السياسية الجارية، مع إعلان عدة دول عن مواقف جديدة تجاه القضايا الإقليمية المطروحة.",
    imageUrl: "https://picsum.photos/800/600?random=2",
    category: "سياسة",
    publishDate: "2024-01-15",
    readTime: "5 دقائق",
    slug: "political-developments-arab-region",
  },
  {
    id: "2",
    title: "ارتفاع أسعار النفط يؤثر على الاقتصاد العالمي",
    summary:
      "شهدت أسعار النفط ارتفاعاً ملحوظاً خلال الأسبوع الماضي، مما أثر على الأسواق العالمية وأثار مخاوف من تأثيرات اقتصادية واسعة.",
    imageUrl: "https://picsum.photos/800/600?random=3",
    category: "اقتصاد",
    publishDate: "2024-01-14",
    readTime: "4 دقائق",
    slug: "oil-prices-global-economy",
  },
  {
    id: "3",
    title: "فوز فريق كرة القدم الوطني في البطولة الآسيوية",
    summary:
      "حقق فريق كرة القدم الوطني فوزاً تاريخياً في البطولة الآسيوية، مما أثار فرحة كبيرة في الشارع العربي.",
    imageUrl: "https://picsum.photos/800/600?random=4",
    category: "رياضة",
    publishDate: "2024-01-13",
    readTime: "3 دقائق",
    slug: "national-team-asian-championship",
  },
  {
    id: "4",
    title: "اختراق جديد في مجال الذكاء الاصطناعي",
    summary:
      "أعلنت شركة تقنية رائدة عن اختراق جديد في مجال الذكاء الاصطناعي، مما يفتح آفاقاً جديدة في التطبيقات العملية.",
    imageUrl: "https://picsum.photos/800/600?random=5",
    category: "تكنولوجيا",
    publishDate: "2024-01-12",
    readTime: "6 دقائق",
    slug: "ai-breakthrough-technology",
  },
  {
    id: "5",
    title: "تطورات الأزمة الأوكرانية وتأثيراتها الإقليمية",
    summary:
      "شهدت الأزمة الأوكرانية تطورات جديدة مع تأثيرات واضحة على المنطقة العربية والاقتصاد العالمي.",
    imageUrl: "https://picsum.photos/800/600?random=6",
    category: "عالمية",
    publishDate: "2024-01-11",
    readTime: "7 دقائق",
    slug: "ukraine-crisis-regional-impact",
  },
  {
    id: "6",
    title: "إطلاق مشروع طاقة متجددة جديد في الخليج",
    summary:
      "أعلنت إحدى دول الخليج عن إطلاق مشروع طاقة متجددة ضخم، مما يعزز مكانتها في مجال الطاقة النظيفة.",
    imageUrl: "https://picsum.photos/800/600?random=7",
    category: "اقتصاد",
    publishDate: "2024-01-10",
    readTime: "4 دقائق",
    slug: "gulf-renewable-energy-project",
  },
  {
    id: "7",
    title: "تطورات في مجال التعليم الرقمي في الوطن العربي",
    summary:
      "شهد مجال التعليم الرقمي تطورات مهمة في الوطن العربي، مع إطلاق منصات تعليمية جديدة ومبتكرة.",
    imageUrl: "https://picsum.photos/800/600?random=8",
    category: "تكنولوجيا",
    publishDate: "2024-01-09",
    readTime: "5 دقائق",
    slug: "digital-education-arab-world",
  },
  {
    id: "8",
    title: "نجاح أول رحلة فضائية عربية مأهولة",
    summary:
      "حققت الدول العربية إنجازاً تاريخياً بإطلاق أول رحلة فضائية مأهولة، مما يفتح آفاقاً جديدة في مجال الفضاء.",
    imageUrl: "https://picsum.photos/800/600?random=9",
    category: "تكنولوجيا",
    publishDate: "2024-01-08",
    readTime: "8 دقائق",
    slug: "first-arab-manned-space-mission",
  },
];

export const featuredNews: NewsArticle = {
  id: "featured-1",
  title: "قمة عربية تاريخية تبحث مستقبل المنطقة",
  summary:
    "انعقدت قمة عربية تاريخية جمعت قادة الدول العربية لمناقشة التحديات المستقبلية ووضع استراتيجية شاملة لتطوير المنطقة في مختلف المجالات الاقتصادية والسياسية والاجتماعية.",
  imageUrl: "https://picsum.photos/1200/800?random=1",
  category: "سياسة",
  publishDate: "2024-01-16",
  readTime: "10 دقائق",
  slug: "historic-arab-summit-region-future",
};
