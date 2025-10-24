export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  category: string;
  publishDate: string;
  readTime: string;
  content?: string;
}

export const sampleNews: NewsArticle[] = [
  {
    id: "1",
    title: "تطورات جديدة في الأزمة السياسية في المنطقة العربية",
    summary:
      "شهدت المنطقة العربية تطورات مهمة في الأزمة السياسية الجارية، مع إعلان عدة دول عن مواقف جديدة تجاه القضايا الإقليمية المطروحة.",
    imageUrl:
      "https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=800&h=600&fit=crop",
    category: "سياسة",
    publishDate: "2024-01-15",
    readTime: "5 دقائق",
  },
  {
    id: "2",
    title: "ارتفاع أسعار النفط يؤثر على الاقتصاد العالمي",
    summary:
      "شهدت أسعار النفط ارتفاعاً ملحوظاً خلال الأسبوع الماضي، مما أثر على الأسواق العالمية وأثار مخاوف من تأثيرات اقتصادية واسعة.",
    imageUrl:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
    category: "اقتصاد",
    publishDate: "2024-01-14",
    readTime: "4 دقائق",
  },
  {
    id: "3",
    title: "فوز فريق كرة القدم الوطني في البطولة الآسيوية",
    summary:
      "حقق فريق كرة القدم الوطني فوزاً تاريخياً في البطولة الآسيوية، مما أثار فرحة كبيرة في الشارع العربي.",
    imageUrl:
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=600&fit=crop",
    category: "رياضة",
    publishDate: "2024-01-13",
    readTime: "3 دقائق",
  },
  {
    id: "4",
    title: "اختراق جديد في مجال الذكاء الاصطناعي",
    summary:
      "أعلنت شركة تقنية رائدة عن اختراق جديد في مجال الذكاء الاصطناعي، مما يفتح آفاقاً جديدة في التطبيقات العملية.",
    imageUrl:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop",
    category: "تكنولوجيا",
    publishDate: "2024-01-12",
    readTime: "6 دقائق",
  },
  {
    id: "5",
    title: "تطورات الأزمة الأوكرانية وتأثيراتها الإقليمية",
    summary:
      "شهدت الأزمة الأوكرانية تطورات جديدة مع تأثيرات واضحة على المنطقة العربية والاقتصاد العالمي.",
    imageUrl:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
    category: "عالمية",
    publishDate: "2024-01-11",
    readTime: "7 دقائق",
  },
  {
    id: "6",
    title: "إطلاق مشروع طاقة متجددة جديد في الخليج",
    summary:
      "أعلنت إحدى دول الخليج عن إطلاق مشروع طاقة متجددة ضخم، مما يعزز مكانتها في مجال الطاقة النظيفة.",
    imageUrl:
      "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&h=600&fit=crop",
    category: "اقتصاد",
    publishDate: "2024-01-10",
    readTime: "4 دقائق",
  },
  {
    id: "7",
    title: "تطورات في مجال التعليم الرقمي في الوطن العربي",
    summary:
      "شهد مجال التعليم الرقمي تطورات مهمة في الوطن العربي، مع إطلاق منصات تعليمية جديدة ومبتكرة.",
    imageUrl:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop",
    category: "تكنولوجيا",
    publishDate: "2024-01-09",
    readTime: "5 دقائق",
  },
  {
    id: "8",
    title: "نجاح أول رحلة فضائية عربية مأهولة",
    summary:
      "حققت الدول العربية إنجازاً تاريخياً بإطلاق أول رحلة فضائية مأهولة، مما يفتح آفاقاً جديدة في مجال الفضاء.",
    imageUrl:
      "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800&h=600&fit=crop",
    category: "تكنولوجيا",
    publishDate: "2024-01-08",
    readTime: "8 دقائق",
  },
];

export const featuredNews: NewsArticle = {
  id: "featured-1",
  title: "قمة عربية تاريخية تبحث مستقبل المنطقة",
  summary:
    "انعقدت قمة عربية تاريخية جمعت قادة الدول العربية لمناقشة التحديات المستقبلية ووضع استراتيجية شاملة لتطوير المنطقة في مختلف المجالات الاقتصادية والسياسية والاجتماعية.",
  imageUrl:
    "https://images.unsplash.com/photo-1582213782179-e0d53f98f2a7?w=1200&h=800&fit=crop",
  category: "سياسة",
  publishDate: "2024-01-16",
  readTime: "10 دقائق",
};



