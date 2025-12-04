import { z } from 'zod';

// مخطط التحقق من صحة بيانات المقالة
export const articleSchema = z.object({
  title: z.string()
    .min(10, 'العنوان يجب أن يكون على الأقل 10 أحرف')
    .max(200, 'العنوان يجب أن يكون أقل من 200 حرف'),
  
  summary: z.string()
    .min(20, 'الملخص يجب أن يكون على الأقل 20 حرف')
    .max(500, 'الملخص يجب أن يكون أقل من 500 حرف'),
  
  content: z.string()
    .min(100, 'المحتوى يجب أن يكون على الأقل 100 حرف'),
  
  category: z.string()
    .min(1, 'يجب اختيار فئة'),
  
  subcategory: z.string().optional(),
  
  tags: z.array(z.string()).optional(),
  
  featuredImage: z.string()
    .min(1, 'يجب إضافة صورة رئيسية'),
  
  status: z.enum(['draft', 'pending', 'published', 'rejected']).default('draft'),
  
  isTrending: z.boolean().default(false),
  
  trendingUntil: z.string().optional(),
});

// مخطط التحقق من صحة بيانات المستخدم
export const userSchema = z.object({
  name: z.string()
    .min(2, 'الاسم يجب أن يكون على الأقل حرفين')
    .max(50, 'الاسم يجب أن يكون أقل من 50 حرف'),
  
  email: z.string()
    .email('البريد الإلكتروني غير صحيح'),
  
  password: z.string()
    .min(8, 'كلمة المرور يجب أن تكون على الأقل 8 أحرف')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'كلمة المرور يجب أن تحتوي على حرف صغير وحرف كبير ورقم'),
  
  role: z.enum(['writer', 'admin', 'super_admin']),
});

// مخطط التحقق من صحة بيانات تسجيل الدخول
export const loginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

// مخطط التحقق من صحة بيانات التعديل
export const updateArticleSchema = articleSchema.partial();

// أنواع البيانات المستخرجة من المخططات
export type ArticleFormData = z.infer<typeof articleSchema>;
export type UserFormData = z.infer<typeof userSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type UpdateArticleFormData = z.infer<typeof updateArticleSchema>;



























