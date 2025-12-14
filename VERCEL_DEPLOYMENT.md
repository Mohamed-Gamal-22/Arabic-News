# دليل رفع المشروع على Vercel

## الخطوات المطلوبة

### 1. إعداد Environment Variables في Vercel

اذهب إلى إعدادات المشروع في Vercel وأضف المتغيرات التالية:

#### Environment Variables المطلوبة:

```
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-project.vercel.app
NEXT_PUBLIC_API_URL=https://newswebsite.runasp.net/api
```

#### كيفية إنشاء NEXTAUTH_SECRET:

يمكنك إنشاء secret key باستخدام أحد الأوامر التالية:

```bash
# على Linux/Mac
openssl rand -base64 32

# على Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 2. إعدادات Vercel

المشروع جاهز للرفع على Vercel مع الإعدادات التالية:

- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next` (افتراضي)
- **Install Command**: `npm install`
- **Node Version**: 20.x (افتراضي في Vercel)

### 3. ملفات الإعداد

تم إنشاء الملفات التالية:

- `vercel.json` - إعدادات Vercel
- `next.config.ts` - إعدادات Next.js مع output: "standalone"
- `.env.example` - مثال على Environment Variables

### 4. التحقق من البيلد

قبل الرفع، تأكد من أن البيلد يعمل محلياً:

```bash
npm run build
```

### 5. رفع المشروع

#### الطريقة الأولى: عبر Vercel CLI

```bash
npm i -g vercel
vercel
```

#### الطريقة الثانية: عبر GitHub

1. ارفع المشروع على GitHub
2. اذهب إلى [Vercel Dashboard](https://vercel.com/dashboard)
3. اضغط "Add New Project"
4. اختر المشروع من GitHub
5. أضف Environment Variables
6. اضغط "Deploy"

### 6. ملاحظات مهمة

- ✅ تم إصلاح جميع مشاكل TypeScript
- ✅ تم إصلاح جميع استخدامات `any`
- ✅ تم إصلاح جميع catch blocks
- ✅ تم إزالة `--turbopack` من build command للتوافق مع Vercel
- ✅ تم إضافة `output: "standalone"` في next.config.ts

### 7. المشاكل الشائعة وحلولها

#### المشكلة: Build fails بسبب Environment Variables
**الحل**: تأكد من إضافة جميع Environment Variables في Vercel Dashboard

#### المشكلة: NextAuth لا يعمل
**الحل**: تأكد من:
- إضافة `NEXTAUTH_SECRET` و `NEXTAUTH_URL` بشكل صحيح
- `NEXTAUTH_URL` يجب أن يكون URL المشروع على Vercel

#### المشكلة: API calls تفشل
**الحل**: تأكد من:
- إضافة `NEXT_PUBLIC_API_URL` بشكل صحيح
- أن API server يسمح بـ CORS من domain Vercel

### 8. التحقق من النشر

بعد النشر، تحقق من:
- ✅ الصفحة الرئيسية تعمل
- ✅ تسجيل الدخول يعمل
- ✅ API calls تعمل
- ✅ الصور تظهر بشكل صحيح

## الدعم

إذا واجهت أي مشاكل، راجع:
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)

